# Tact compilation report
Contract: NeuroJettonWallet
BoC Size: 1210 bytes

## Structures (Structs and Messages)
Total structures: 37

### DataSize
TL-B: `_ cells:int257 bits:int257 refs:int257 = DataSize`
Signature: `DataSize{cells:int257,bits:int257,refs:int257}`

### SignedBundle
TL-B: `_ signature:fixed_bytes64 signedData:remainder<slice> = SignedBundle`
Signature: `SignedBundle{signature:fixed_bytes64,signedData:remainder<slice>}`

### StateInit
TL-B: `_ code:^cell data:^cell = StateInit`
Signature: `StateInit{code:^cell,data:^cell}`

### Context
TL-B: `_ bounceable:bool sender:address value:int257 raw:^slice = Context`
Signature: `Context{bounceable:bool,sender:address,value:int257,raw:^slice}`

### SendParameters
TL-B: `_ mode:int257 body:Maybe ^cell code:Maybe ^cell data:Maybe ^cell value:int257 to:address bounce:bool = SendParameters`
Signature: `SendParameters{mode:int257,body:Maybe ^cell,code:Maybe ^cell,data:Maybe ^cell,value:int257,to:address,bounce:bool}`

### MessageParameters
TL-B: `_ mode:int257 body:Maybe ^cell value:int257 to:address bounce:bool = MessageParameters`
Signature: `MessageParameters{mode:int257,body:Maybe ^cell,value:int257,to:address,bounce:bool}`

### DeployParameters
TL-B: `_ mode:int257 body:Maybe ^cell value:int257 bounce:bool init:StateInit{code:^cell,data:^cell} = DeployParameters`
Signature: `DeployParameters{mode:int257,body:Maybe ^cell,value:int257,bounce:bool,init:StateInit{code:^cell,data:^cell}}`

### StdAddress
TL-B: `_ workchain:int8 address:uint256 = StdAddress`
Signature: `StdAddress{workchain:int8,address:uint256}`

### VarAddress
TL-B: `_ workchain:int32 address:^slice = VarAddress`
Signature: `VarAddress{workchain:int32,address:^slice}`

### BasechainAddress
TL-B: `_ hash:Maybe int257 = BasechainAddress`
Signature: `BasechainAddress{hash:Maybe int257}`

### Deploy
TL-B: `deploy#946a98b6 queryId:uint64 = Deploy`
Signature: `Deploy{queryId:uint64}`

### DeployOk
TL-B: `deploy_ok#aff90f57 queryId:uint64 = DeployOk`
Signature: `DeployOk{queryId:uint64}`

### FactoryDeploy
TL-B: `factory_deploy#6d0ff13b queryId:uint64 cashback:address = FactoryDeploy`
Signature: `FactoryDeploy{queryId:uint64,cashback:address}`

### ChangeOwner
TL-B: `change_owner#819dbe99 queryId:uint64 newOwner:address = ChangeOwner`
Signature: `ChangeOwner{queryId:uint64,newOwner:address}`

### ChangeOwnerOk
TL-B: `change_owner_ok#327b2b4a queryId:uint64 newOwner:address = ChangeOwnerOk`
Signature: `ChangeOwnerOk{queryId:uint64,newOwner:address}`

### TokenTransfer
TL-B: `token_transfer#0f8a7ea5 queryId:uint64 amount:coins destination:address response_destination:address custom_payload:Maybe ^cell forward_ton_amount:coins forward_payload:remainder<slice> = TokenTransfer`
Signature: `TokenTransfer{queryId:uint64,amount:coins,destination:address,response_destination:address,custom_payload:Maybe ^cell,forward_ton_amount:coins,forward_payload:remainder<slice>}`

### TokenTransferInternal
TL-B: `token_transfer_internal#178d4519 queryId:uint64 amount:coins from:address response_destination:address forward_ton_amount:coins forward_payload:remainder<slice> = TokenTransferInternal`
Signature: `TokenTransferInternal{queryId:uint64,amount:coins,from:address,response_destination:address,forward_ton_amount:coins,forward_payload:remainder<slice>}`

### TokenNotification
TL-B: `token_notification#7362d09c queryId:uint64 amount:coins from:address forward_payload:remainder<slice> = TokenNotification`
Signature: `TokenNotification{queryId:uint64,amount:coins,from:address,forward_payload:remainder<slice>}`

### TokenBurn
TL-B: `token_burn#595f07bc queryId:uint64 amount:coins response_destination:address custom_payload:Maybe ^cell = TokenBurn`
Signature: `TokenBurn{queryId:uint64,amount:coins,response_destination:address,custom_payload:Maybe ^cell}`

### TokenBurnNotification
TL-B: `token_burn_notification#7bdd97de queryId:uint64 amount:coins sender:address response_destination:address = TokenBurnNotification`
Signature: `TokenBurnNotification{queryId:uint64,amount:coins,sender:address,response_destination:address}`

### ProvideWalletAddress
TL-B: `provide_wallet_address#2c76b973 queryId:uint64 owner_address:address include_address:bool = ProvideWalletAddress`
Signature: `ProvideWalletAddress{queryId:uint64,owner_address:address,include_address:bool}`

### TakeWalletAddress
TL-B: `take_wallet_address#d1735400 queryId:uint64 wallet_address:address owner_address:address = TakeWalletAddress`
Signature: `TakeWalletAddress{queryId:uint64,wallet_address:address,owner_address:address}`

### Deposit
TL-B: `deposit#8ea64828 intent:uint8 = Deposit`
Signature: `Deposit{intent:uint8}`

### RequestWithdrawal
TL-B: `request_withdrawal#ea9ab10e amount:coins = RequestWithdrawal`
Signature: `RequestWithdrawal{amount:coins}`

### AutoCompound
TL-B: `auto_compound#e9e7e01c profitToMint:coins = AutoCompound`
Signature: `AutoCompound{profitToMint:coins}`

### ExecDelegate
TL-B: `exec_delegate#4afe4ba2 target:address amount:coins mode:uint8 payload:Maybe ^cell = ExecDelegate`
Signature: `ExecDelegate{target:address,amount:coins,mode:uint8,payload:Maybe ^cell}`

### UpdateFee
TL-B: `update_fee#bb6eac71 performanceFeePrecise:uint16 = UpdateFee`
Signature: `UpdateFee{performanceFeePrecise:uint16}`

### UpdateOperator
TL-B: `update_operator#61f2e5d4 newOperator:address = UpdateOperator`
Signature: `UpdateOperator{newOperator:address}`

### SetWhitelist
TL-B: `set_whitelist#3b3c0bbc index:uint8 target:address = SetWhitelist`
Signature: `SetWhitelist{index:uint8,target:address}`

### UpdateAutoCompoundCap
TL-B: `update_auto_compound_cap#374cf45d newCap:uint16 = UpdateAutoCompoundCap`
Signature: `UpdateAutoCompoundCap{newCap:uint16}`

### SwapAdditionalData
TL-B: `_ minOut:coins receiverAddress:address fwdGas:coins customPayload:Maybe ^cell = SwapAdditionalData`
Signature: `SwapAdditionalData{minOut:coins,receiverAddress:address,fwdGas:coins,customPayload:Maybe ^cell}`

### StonfiSwap
TL-B: `stonfi_swap#6664de2a otherTokenWallet:address refundAddress:address excessesAddress:address deadline:uint64 additionalData:SwapAdditionalData{minOut:coins,receiverAddress:address,fwdGas:coins,customPayload:Maybe ^cell} = StonfiSwap`
Signature: `StonfiSwap{otherTokenWallet:address,refundAddress:address,excessesAddress:address,deadline:uint64,additionalData:SwapAdditionalData{minOut:coins,receiverAddress:address,fwdGas:coins,customPayload:Maybe ^cell}}`

### StonfiProvideLiquidity
TL-B: `stonfi_provide_liquidity#c7bd6a59 otherTokenWallet:address refundAddress:address excessesAddress:address deadline:uint64 minLpOut:coins = StonfiProvideLiquidity`
Signature: `StonfiProvideLiquidity{otherTokenWallet:address,refundAddress:address,excessesAddress:address,deadline:uint64,minLpOut:coins}`

### NeuroJettonWallet$Data
TL-B: `_ balance:int257 owner:address master:address = NeuroJettonWallet`
Signature: `NeuroJettonWallet{balance:int257,owner:address,master:address}`

### JettonWalletData
TL-B: `_ balance:int257 owner:address master:address walletCode:^cell = JettonWalletData`
Signature: `JettonWalletData{balance:int257,owner:address,master:address,walletCode:^cell}`

### NeuroVault$Data
TL-B: `_ owner:address operator:address totalSupply:coins totalAssets:coins performanceFeePrecise:uint16 minDepositAmount:coins autoCompoundCap:uint16 whitelistCount:uint8 whitelist1:address whitelist2:address whitelist3:address whitelist4:address whitelist5:address content:^cell mintable:bool = NeuroVault`
Signature: `NeuroVault{owner:address,operator:address,totalSupply:coins,totalAssets:coins,performanceFeePrecise:uint16,minDepositAmount:coins,autoCompoundCap:uint16,whitelistCount:uint8,whitelist1:address,whitelist2:address,whitelist3:address,whitelist4:address,whitelist5:address,content:^cell,mintable:bool}`

### JettonData
TL-B: `_ totalSupply:int257 mintable:bool owner:address content:^cell walletCode:^cell = JettonData`
Signature: `JettonData{totalSupply:int257,mintable:bool,owner:address,content:^cell,walletCode:^cell}`

## Get methods
Total get methods: 1

## get_wallet_data
No arguments

## Exit codes
* 2: Stack underflow
* 3: Stack overflow
* 4: Integer overflow
* 5: Integer out of expected range
* 6: Invalid opcode
* 7: Type check error
* 8: Cell overflow
* 9: Cell underflow
* 10: Dictionary error
* 11: 'Unknown' error
* 12: Fatal error
* 13: Out of gas error
* 14: Virtualization error
* 32: Action list is invalid
* 33: Action list is too long
* 34: Action is invalid or not supported
* 35: Invalid source address in outbound message
* 36: Invalid destination address in outbound message
* 37: Not enough Toncoin
* 38: Not enough extra currencies
* 39: Outbound message does not fit into a cell after rewriting
* 40: Cannot process a message
* 41: Library reference is null
* 42: Library change action error
* 43: Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree
* 50: Account state size exceeded limits
* 128: Null reference exception
* 129: Invalid serialization prefix
* 130: Invalid incoming message
* 131: Constraints error
* 132: Access denied
* 133: Contract stopped
* 134: Invalid argument
* 135: Code of a contract was not found
* 136: Invalid standard address
* 138: Not a basechain address
* 3256: Deposit too small to mint shares
* 3734: Not Owner
* 4429: Invalid sender
* 4675: Insufficient vault assets
* 7926: Fee shares too small to mint
* 8987: Invalid sender: not owner or operator
* 12392: Withdrawal amount too small
* 12776: Whitelist index must be 1-5
* 14294: Mint is disabled
* 14534: Not owner
* 16059: Invalid value
* 16341: No profit to register
* 16897: Deposit must respect the mathematical minimum (3 TON) to cover network fees.
* 17347: Profit exceeds single-cycle cap
* 27021: Invalid supply state
* 33824: Yield reception only from whitelisted protocols
* 38247: ExecDelegate exceeds available assets
* 43422: Invalid value - Burn
* 44977: Cap too high! Max 10% per cycle
* 51355: Target not in protocol whitelist
* 53830: Insufficient TON sent for gas buffer.
* 55717: Cannot delegate zero amount
* 58338: Fee too high! Max 30% allowed
* 59952: Cannot burn zero tokens
* 61374: Invalid burn notification sender
* 62972: Invalid balance

## Trait inheritance diagram

```mermaid
graph TD
NeuroJettonWallet
NeuroJettonWallet --> BaseTrait
```

## Contract dependency diagram

```mermaid
graph TD
NeuroJettonWallet
```