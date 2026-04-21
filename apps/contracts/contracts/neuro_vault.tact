import "@stdlib/deploy";

/// Represents a deposit intent into the vault
message Deposit {
    intent: Int as uint8;
}

/// Represents a simple withdrawal intent
message TokenBurn {
    queryId: Int as uint64;
    amount: Int as coins;
    response_destination: Address;
    custom_payload: Bool;
}

contract NeuroVault with Deployable {
    owner: Address;
    tvl: Int as coins;

    init(owner: Address) {
        self.owner = owner;
        self.tvl = 0;
    }

    receive(msg: Deposit) {
        let ctx: Context = context();
        let value: Int = ctx.value;
        require(value > 0, "Must deposit more than 0");
        
        self.tvl = self.tvl + value;
        // Mock generation of shares, usually we'd mint Jettons here.
    }

    /// Omission of complex jetton minting code for brevity initially, 
    /// but TVL tracks the native TON deposited.
    
    get fun tvl(): Int {
        return self.tvl;
    }
}
