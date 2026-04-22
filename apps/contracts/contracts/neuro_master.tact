import "@stdlib/deploy";
import "./messages.tact";
import "./neuro_wallet.tact";

@interface("org.ton.jetton.master")
contract NeuroMaster with Deployable {
    total_supply: Int as coins;
    total_assets: Int as coins;      // [FIX C1] Track actual TON held (not just supply)
    owner: Address;
    keeper: Address;
    paused: Bool;
    jetton_content: Cell;
    mintable: Bool;

    // [FIX C2] Whitelist slots — only whitelisted protocols can receive delegated funds
    whitelist1: Address?;
    whitelist2: Address?;
    whitelist3: Address?;
    whitelist4: Address?;
    whitelist5: Address?;

    // [FIX C2] Per-transaction delegation cap (50% of totalAssets)
    maxDelegatePercent: Int as uint8;

    init(owner: Address, keeper: Address, jetton_content: Cell) {
        self.total_supply = 0;
        self.total_assets = 0;
        self.owner = owner;
        self.keeper = keeper;
        self.jetton_content = jetton_content;
        self.mintable = true;
        self.paused = false;
        self.maxDelegatePercent = 50;

        self.whitelist1 = null;
        self.whitelist2 = null;
        self.whitelist3 = null;
        self.whitelist4 = null;
        self.whitelist5 = null;
    }

    // ─── User Actions ───

    receive(msg: Deposit) {
        require(!self.paused, "Vault is paused");
        
        let ctx: Context = context();
        let value: Int = ctx.value;
        require(value > 100000000, "Deposit must be > 0.1 TON to cover fees");
        
        let depositValue: Int = value - 50000000; // Deduct gas

        // [FIX C1] Compute shares using share-price math:
        // If totalAssets == 0 or totalSupply == 0, mint 1:1
        // Otherwise: shares = depositValue * totalSupply / totalAssets
        let minted: Int = depositValue;
        if (self.total_supply > 0 && self.total_assets > 0) {
            minted = depositValue * self.total_supply / self.total_assets;
        }
        
        self.total_supply = self.total_supply + minted;
        self.total_assets = self.total_assets + depositValue;

        let initCode: StateInit = initOf NeuroWallet(myAddress(), ctx.sender);
        
        send(SendParameters{
            to: contractAddress(initCode),
            value: 50000000,
            mode: 0,
            bounce: true,
            body: TokenTransferInternal{
                queryId: 0,
                amount: minted,
                from: myAddress(),
                response_destination: ctx.sender,
                forward_ton_amount: 0,
                forward_payload: emptySlice()
            }.toCell(),
            code: initCode.code,
            data: initCode.data
        });
    }

    receive(msg: TokenBurnNotification) {
        let ctx: Context = context();
        let initCode: StateInit = initOf NeuroWallet(myAddress(), msg.sender);
        require(contractAddress(initCode) == ctx.sender, "Unauthorized burn notification");
        
        // [FIX C1] Calculate TON to return using share-price math:
        // tonToReturn = burnAmount * totalAssets / totalSupply
        let tonToReturn: Int = msg.amount;
        if (self.total_supply > 0 && self.total_assets > 0) {
            tonToReturn = msg.amount * self.total_assets / self.total_supply;
        }

        self.total_supply = self.total_supply - msg.amount;
        self.total_assets = self.total_assets - tonToReturn;

        // Send back calculated TON to user
        send(SendParameters{
            to: msg.sender,
            value: tonToReturn,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "Withdrawal".asComment()
        });

        if (msg.response_destination != null) {
            send(SendParameters{
                to: msg.response_destination!!,
                value: 0,
                mode: SendRemainingValue | SendIgnoreErrors,
                bounce: false,
                body: TokenExcesses{ queryId: msg.queryId }.toCell()
            });
        }
    }

    // ─── Keeper Actions ───

    receive(msg: ExecuteRebalance) {
        let ctx: Context = context();
        require(ctx.sender == self.keeper, "Only Keeper can execute rebalances");
        require(!self.paused, "Vault is paused");

        // [FIX C2] Enforce whitelist — destination MUST be whitelisted
        require(self.isWhitelisted(msg.destination), "Destination not whitelisted");

        // [FIX C2] Enforce per-tx amount cap (maxDelegatePercent of totalAssets)
        let maxAmount: Int = self.total_assets * self.maxDelegatePercent / 100;
        require(msg.amount <= maxAmount, "Amount exceeds delegation cap");
        require(msg.amount > 0, "Amount must be positive");

        // [FIX C2] bounce: true — if destination fails, funds return to vault
        send(SendParameters{
            to: msg.destination,
            value: msg.amount,
            mode: SendIgnoreErrors,
            bounce: true,
            body: "Rebalance".asComment()
        });
    }

    // [FIX C1] AutoCompound — Keeper reports yield. Increases totalAssets without changing supply,
    // which makes each nTON worth more TON (share price goes up).
    receive(msg: AutoCompound) {
        let ctx: Context = context();
        require(ctx.sender == self.keeper || ctx.sender == self.owner, "Unauthorized");
        require(msg.profitToMint > 0, "Profit must be positive");

        // Simply increase totalAssets — this inflates the share price for all nTON holders
        self.total_assets = self.total_assets + msg.profitToMint;
    }

    // ─── Admin Actions ───

    receive("Pause") {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Unauthorized");
        self.paused = true;
    }

    receive("Resume") {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Unauthorized");
        self.paused = false;
    }

    // [FIX C2] SetWhitelist — Owner can configure up to 5 whitelisted protocol addresses
    receive(msg: SetWhitelist) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only owner can set whitelist");
        require(msg.index >= 1 && msg.index <= 5, "Index must be 1-5");

        if (msg.index == 1) { self.whitelist1 = msg.target; }
        if (msg.index == 2) { self.whitelist2 = msg.target; }
        if (msg.index == 3) { self.whitelist3 = msg.target; }
        if (msg.index == 4) { self.whitelist4 = msg.target; }
        if (msg.index == 5) { self.whitelist5 = msg.target; }
    }

    // ─── Internal Helpers ───

    fun isWhitelisted(addr: Address): Bool {
        if (self.whitelist1 != null && self.whitelist1!! == addr) { return true; }
        if (self.whitelist2 != null && self.whitelist2!! == addr) { return true; }
        if (self.whitelist3 != null && self.whitelist3!! == addr) { return true; }
        if (self.whitelist4 != null && self.whitelist4!! == addr) { return true; }
        if (self.whitelist5 != null && self.whitelist5!! == addr) { return true; }
        return false;
    }

    // ─── Get Methods ───

    get fun get_jetton_data(): JettonData {
        return JettonData{
            totalSupply: self.total_supply,
            mintable: self.mintable,
            owner: self.owner,
            content: self.jetton_content,
            walletCode: (initOf NeuroWallet(myAddress(), self.owner)).code
        };
    }

    get fun get_wallet_address(owner: Address): Address {
        let initCode: StateInit = initOf NeuroWallet(myAddress(), owner);
        return contractAddress(initCode);
    }

    // [FIX L3] tvl() now returns actual TON held, not just token supply
    get fun tvl(): Int {
        return self.total_assets;
    }

    // [FIX C1] sharePrice returns nanoTON per 1 nTON (9-decimal fixed point)
    // If no supply exists, returns 1:1 (1e9)
    get fun sharePrice(): Int {
        if (self.total_supply == 0) {
            return 1000000000; // 1.0 in nanoTON
        }
        return self.total_assets * 1000000000 / self.total_supply;
    }

    get fun isPaused(): Bool {
        return self.paused;
    }

    get fun totalAssets(): Int {
        return self.total_assets;
    }
}

struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}
