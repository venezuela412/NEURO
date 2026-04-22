import "@stdlib/deploy";

// ─── TEP-74 Jetton Standard Messages ───

message(0xf8a7ea5) TokenTransfer {
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

message(0xd53276db) TokenExcesses {
    queryId: Int as uint64;
}

message TokenUpdateContent {
    content: Cell;
}

// ─── NeuroTON Specific Messages ───

message Deposit {
    intent: Int as uint8;
}

message ExecuteRebalance {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
}

// [SECURITY FIX C2] Whitelist management — owner-only
message SetWhitelist {
    index: Int as uint8;       // Slot 1–5
    target: Address;           // Protocol address to whitelist
}

// [SECURITY FIX C1] AutoCompound — report yield back to inflate share price
message AutoCompound {
    profitToMint: Int as coins;
}

message ProvideWalletAddress {
    queryId: Int as uint64;
    owner_address: Address;
    include_address: Bool;
}

message TakeWalletAddress {
    queryId: Int as uint64;
    wallet_address: Address;
    owner_address: Address?;
}
