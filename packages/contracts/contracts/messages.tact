// TEP-74 Standard Jetton Transfer
message(0x0f8a7ea5) TokenTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    response_destination: Address;
    custom_payload: Cell?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining; // Used for passing STON.fi specific cells
}

// TEP-74 Standard Internal Transfer Notification (When we receive a Jetton)
message(0x7362d09c) TokenNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forward_payload: Slice as remaining;
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
