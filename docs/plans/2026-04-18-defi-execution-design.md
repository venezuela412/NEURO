# DeFi Execution & Fee Architecture (Enfoque B - Hubrid Client/Server)

## Autocrítica del Diseño Inicial (Self-Critique)
Al revisar el diseño propuesto previamente, detecté dos problemas críticos que deben corregirse en este documento final:
1. **Pérdida de Reconciliación si el usuario cierra la app:** Si delegamos el inicio de la reconciliación exclusivamente al cliente, y el usuario cierra Telegram en los 15 segundos que tarda el bloque en confirmarse, el servidor nunca se entera de que la transacción tuvo éxito. **Corrección:** El backend debe iniciar un proceso en background (o chequear periódicamente durante un poll de estado del cliente) para cualquier `execution_receipt` en estado "submitted" usando el hash inicial de la operación.
2. **Cálculo de Comisiones Erróneo (Timing):** Cobrar o registrar deuda de comisión basándonos en una ganancia *proyectada* al momento del depósito es irreal y contablemente incorrecto. Como menciona el REPO en 14.4, el fee accrual debe basarse en el evento de **realización** (evento *withdraw*, *claim* o *switch-to-safety*). **Corrección:** La tabla `fee_accrual` registrará eventos, pero el servidor no calculará el fee al momento del depósito, sino al rastrear la rentabilidad final usando el High-Water Mark u observando la salida.

## 1. Interfaz del Frontend `ExecutionProvider`

Encapsulamos la complejidad de STON y Tonstakers en el cliente para aprovechar la infraestructura existente de TonConnect.

```typescript
export interface ExecutionProvider<TQuote> {
  // 1. Cotiza el coste/retorno real de la red
  quote(amountTon: number): Promise<TQuote>;
  
  // 2. Genera los payload messages listos para TonConnect
  buildMessages(quote: TQuote): Promise<TonConnectMessage[]>;
  
  // 3. Envía a la red (firmado localmente) y devuelve Hash y/o BOC
  submit(messages: TonConnectMessage[]): Promise<{ hash: string, boc?: string }>;
  
  // 4. (Opcional para feedback visual) Poll de confirmación local en cliente
  poll(hash: string): Promise<ExecutionStatus>;
}
```

## 2. Base de Datos & Fees (`control-plane/src/db.ts`)

Para soportar cobros transparentes cuando la inversión se retira o liquida:

```sql
CREATE TABLE IF NOT EXISTS fee_accrual (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  event_type TEXT NOT NULL,       /* 'withdraw', 'claim', 'close' */
  realized_profit_nano TEXT NOT NULL, 
  fee_amount_nano TEXT NOT NULL,  
  status TEXT NOT NULL,           /* 'pending', 'settled' */
  created_at TEXT NOT NULL
);
```

## 3. Reconciliación en Backend (`reconciliation.ts`)

- Frontend avisa al Servidor: "Envié este Hash para esta ExecID". El servidor cambia el estado a `submitted`.
- El servidor hace fetch contra un endpoint público (p. ej. **TonAPI** `https://tonapi.io/v2/blockchain/transactions/{hash}`).
- Si se detecta *jetton swap* o emitido el staking, cambia el estado a `success` y crea el snapshot de portafolio real validado.
- Durante retiros futuros (`/withdraw` o `/switch-to-safety`), el backend lee el capital inicial vs final, calcula la ganancia real, extrae el % de fee usando la lógica de paquete `domain` y lo apunta en `fee_accrual`.
