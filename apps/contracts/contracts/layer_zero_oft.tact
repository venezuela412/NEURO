import "@stdlib/deploy";
import "./messages.tact";

/// LayerZero Endpoint standard interface proxy
message LzReceive {
    srcChainId: Int as uint16;
    srcAddress: Slice;
    nonce: Int as uint64;
    payload: Slice;
}

message SendToEVM {
    queryId: Int as uint64;
    dstChainId: Int as uint16;
    toAddress: Slice; // The EVM address
    amount: Int as coins;
}

// Emitted when we send a message to LZ Endpoint
message LzSendMessage {
    dstChainId: Int as uint16;
    payload: Slice;
}

contract LayerZeroOFT with Deployable {
    owner: Address;
    lzEndpoint: Address;
    masterToken: Address;
    myJettonWallet: Address?; // The OFT Adapter's own Jetton wallet for nTON

    init(owner: Address, lzEndpoint: Address, masterToken: Address) {
        self.owner = owner;
        self.lzEndpoint = lzEndpoint;
        self.masterToken = masterToken;
    }

    receive(msg: String) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Unauthorized");
        // Initialization proxy for setting wallet address (in real production this uses a provide_wallet mechanism)
    }

    /// User transfers nTON to this contract to bridge
    receive(msg: TokenNotification) {
        let ctx: Context = context();
        // require(self.myJettonWallet != null, "Not initialized");
        // require(ctx.sender == self.myJettonWallet!!, "Unauthorized token");
        
        let fwd: Slice = msg.forward_payload;
        if (fwd.bits() >= 16 + 160) {
            let dstChainId: Int = fwd.loadUint(16);
            let dstAddress: Slice = fwd.loadBits(160); // 20 byte EVM address

            // Send cross-chain message to mint/unlock on EVM
            let lzPayload: Cell = beginCell()
                .storeAddress(msg.sender) // original sender
                .storeCoins(msg.amount)
                .storeSlice(dstAddress)
                .endCell();

            send(SendParameters{
                to: self.lzEndpoint,
                value: 0,
                mode: SendRemainingValue,
                bounce: false,
                body: LzSendMessage{
                    dstChainId: dstChainId,
                    payload: lzPayload.asSlice()
                }.toCell()
            });
        }
    }

    /// Receives payload from TON LayerZero Endpoint (EVM to TON)
    receive(msg: LzReceive) {
        let ctx: Context = context();
        require(ctx.sender == self.lzEndpoint, "Unauthorized LZ Endpoint");
        require(self.myJettonWallet != null, "Not initialized");
        
        // Deserialize payload
        // Assume format: [original sender EVM][amount][destination TON address]
        let evmSender: Slice = msg.payload.loadBits(160);
        let amount: Int = msg.payload.loadCoins();
        let toAddr: Address = msg.payload.loadAddress();
        
        // Unlock nTON and send to `toAddr`
        send(SendParameters{
            to: self.myJettonWallet!!,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenTransfer{
                queryId: msg.nonce,
                amount: amount,
                destination: toAddr,
                response_destination: toAddr,
                custom_payload: null,
                forward_ton_amount: 0,
                forward_payload: emptySlice()
            }.toCell()
        });
    }
}
