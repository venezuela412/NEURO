import { useTonAddress, useTonWallet } from "@tonconnect/ui-react";

export function useNeuroWallet() {
  const wallet = useTonWallet();
  const address = useTonAddress();

  return {
    connected: Boolean(wallet),
    address,
    walletName: wallet?.device.appName ?? "TON wallet",
    wallet,
  };
}

export const useTonWalletState = useNeuroWallet;
