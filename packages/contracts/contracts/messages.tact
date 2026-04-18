// TEP-74 Standard Jetton Transfer
message(0x0f8a7ea5) TokenTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    response_destination: Address?;
    custom_payload: Cell?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x178d4519) TokenTransferInternal {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    response_destination: Address?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x7362d09c) TokenNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forward_payload: Slice as remaining;
}

message(0x595f07bc) TokenBurn {
    queryId: Int as uint64;
    amount: Int as coins;
    response_destination: Address?;
    custom_payload: Cell?;
}

message(0x7bdd97de) TokenBurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    response_destination: Address?;
}

message(0x2c76b973) ProvideWalletAddress {
    queryId: Int as uint64;
    owner_address: Address;
    include_address: Bool;
}

message(0xd1735400) TakeWalletAddress {
    queryId: Int as uint64;
    wallet_address: Address;
    owner_address: Address?;
}

// Vault specific messages
message Deposit {
    intent: Int as uint8; // 1 = Safe, 2 = Farm High Freq
}

message RequestWithdrawal {
    amount: Int as coins;
}

message AutoCompound {
    profitToMint: Int as coins; // Profit value in TON used to mint royalty nTON.
}

message ExecDelegate {
    target: Address;
    amount: Int as coins;
    mode: Int as uint8;
    payload: Cell?;
}

message UpdateFee {
    performanceFeePrecise: Int as uint16;
}

message UpdateOperator {
    newOperator: Address;
}

// STON.fi V2 Specific Swap structures
struct SwapAdditionalData {
    minOut: Int as coins;              
    receiverAddress: Address;          
    fwdGas: Int as coins;              
    customPayload: Cell?;              
}

message(0x6664de2a) StonfiSwap {
    otherTokenWallet: Address;         
    refundAddress: Address;            
    excessesAddress: Address;          
    deadline: Int as uint64;           
    additionalData: SwapAdditionalData;
}

message(0xc7bd6a59) StonfiProvideLiquidity {
    otherTokenWallet: Address;
    refundAddress: Address;
    excessesAddress: Address;
    deadline: Int as uint64;
    minLpOut: Int as coins;
}
