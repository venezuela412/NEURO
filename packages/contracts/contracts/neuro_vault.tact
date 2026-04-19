import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages.tact";
import "./neuro_jetton_wallet.tact";

// The APEX Vault: Jetton Master, Intent Zapper, Zero-Trust Execution
contract NeuroVault with Deployable, OwnableTransferable {
    
    // Core parameters
    owner: Address;
    operator: Address; // Backend Agent

    // Math & States for nTON
    totalSupply: Int as coins;
    totalAssets: Int as coins; // Physical TON held inside
    
    // Limits & Security
    performanceFeePrecise: Int as uint16; // e.g. 2000 = 20%
    minDepositAmount: Int as coins; // Minimum 3 TON to prevent gas friction
    autoCompoundCap: Int as uint16; // Max % of totalAssets allowed as profit in one compound (e.g. 500 = 5%)

    // Protocol Whitelist (up to 5 addresses)
    whitelistCount: Int as uint8;
    whitelist1: Address;
    whitelist2: Address;
    whitelist3: Address;
    whitelist4: Address;
    whitelist5: Address;

    // Jetton Metadata
    content: Cell;
    mintable: Bool;

    init(owner: Address, content: Cell) {
        self.owner = owner;
        self.operator = owner; 
        self.totalSupply = 0;
        self.totalAssets = 0;
        self.performanceFeePrecise = 2000; 
        self.minDepositAmount = ton("3.0");
        self.autoCompoundCap = 500; // 5% max per compound cycle
        self.content = content;
        self.mintable = true;

        // Initialize whitelist with zero-address placeholders
        self.whitelistCount = 0;
        self.whitelist1 = newAddress(0, 0);
        self.whitelist2 = newAddress(0, 0);
        self.whitelist3 = newAddress(0, 0);
        self.whitelist4 = newAddress(0, 0);
        self.whitelist5 = newAddress(0, 0);
    }

    fun requireOwnerOrOperator() {
        let ctx: Context = context();
        require(ctx.sender == self.owner || ctx.sender == self.operator, "Invalid sender: not owner or operator");
    }

    fun isWhitelisted(target: Address): Bool {
        if (target == self.owner) { return true; }
        if (self.whitelistCount >= 1 && target == self.whitelist1) { return true; }
        if (self.whitelistCount >= 2 && target == self.whitelist2) { return true; }
        if (self.whitelistCount >= 3 && target == self.whitelist3) { return true; }
        if (self.whitelistCount >= 4 && target == self.whitelist4) { return true; }
        if (self.whitelistCount >= 5 && target == self.whitelist5) { return true; }
        return false;
    }

    // 1. ZEN STAKING & ZAPPER INBOUND
    receive(msg: Deposit) {
        let ctx: Context = context();
        let depositVal: Int = ctx.value;
        
        // Strict operational limit to avoid burning small capital
        require(depositVal >= self.minDepositAmount, "Deposit must respect the mathematical minimum (3 TON) to cover network fees.");
        
        // Ensure gas buffer is maintained
        require(depositVal > self.reserveGas(), "Insufficient TON sent for gas buffer.");
        let netDeposit: Int = depositVal - self.reserveGas();

        // Mathematical Parity of nTON
        let sharesToMint: Int = 0;
        if (self.totalSupply == 0 || self.totalAssets == 0) {
            sharesToMint = netDeposit; // Genesis ratio 1:1
        } else {
            sharesToMint = (netDeposit * self.totalSupply) / self.totalAssets;
        }

        // Prevent zero-share minting (rounding dust attack)
        require(sharesToMint > 0, "Deposit too small to mint shares");

        self.totalAssets = self.totalAssets + netDeposit;
        self.totalSupply = self.totalSupply + sharesToMint;

        // Mint physical Jettons to the user
        self.mintTokens(ctx.sender, sharesToMint, ctx.sender);
    }

    // 2. ADVANCED MODE: LST Burning (Withdrawal)
    receive(msg: TokenBurnNotification) {
        let ctx: Context = context();
        
        // Only the legitimate wallet of the sender can trigger this.
        let expectedWalletAddress: Address = contractAddress(initOf NeuroJettonWallet(myAddress(), msg.sender));
        require(ctx.sender == expectedWalletAddress, "Invalid burn notification sender");

        require(msg.amount > 0, "Cannot burn zero tokens");
        require(self.totalSupply >= msg.amount, "Invalid supply state");

        // Calculate underlying TON value to unlock
        let tonToRelease: Int = (msg.amount * self.totalAssets) / self.totalSupply;
        require(tonToRelease > 0, "Withdrawal amount too small");

        // Ensure vault has enough balance after release
        require(self.totalAssets >= tonToRelease, "Insufficient vault assets");

        self.totalSupply = self.totalSupply - msg.amount;
        self.totalAssets = self.totalAssets - tonToRelease;

        let dest: Address = msg.sender;
        if (msg.response_destination != null) {
            dest = msg.response_destination!!;
        }

        // Dispatch physical TON back to user
        send(SendParameters{
            to: dest, 
            value: tonToRelease,
            mode: SendIgnoreErrors,
            bounce: true, // Changed: bounce on invalid address instead of burning funds
            body: "Withdrawal Successful".asComment()
        });
    }

    // Direct Yield Reception from STON.fi or Tonstakers.
    // totalAssets goes up while totalSupply stays the same — LST price increases.
    // SECURITY: Only accept from whitelisted protocols or owner
    receive() {
        let ctx: Context = context();
        require(
            self.isWhitelisted(ctx.sender) || ctx.sender == self.operator,
            "Yield reception only from whitelisted protocols"
        );
        self.totalAssets = self.totalAssets + ctx.value;
    }

    // 3. ZERO-TRUST: Agent Autonomous Compounding & Fees
    receive(msg: AutoCompound) {
        self.requireOwnerOrOperator();
        require(msg.profitToMint > 0, "No profit to register");

        // SECURITY CAP: Profit cannot exceed autoCompoundCap % of totalAssets in one cycle
        let maxAllowedProfit: Int = (self.totalAssets * self.autoCompoundCap) / 10000;
        require(msg.profitToMint <= maxAllowedProfit, "Profit exceeds single-cycle cap");

        // The Agent calculates actual profit via backend and commands the vault to secure fees.
        let ownerCutNative: Int = (msg.profitToMint * self.performanceFeePrecise) / 10000;
        
        // Mint new shares to the treasury. This dilutes the ratio growth by fee%, extracting fee.
        let sharesToMint: Int = (ownerCutNative * self.totalSupply) / self.totalAssets;
        require(sharesToMint > 0, "Fee shares too small to mint");
        
        self.totalSupply = self.totalSupply + sharesToMint;
        
        // Mint the LST to the protocol's owner wallet
        self.mintTokens(self.owner, sharesToMint, self.owner);
    }

    // 4. THE APEX REBALANCER: Agent restricted to WHITELISTED protocol addresses only
    receive(msg: ExecDelegate) {
        self.requireOwnerOrOperator();
        
        // CRITICAL ZERO-TRUST SHIELD: Only whitelisted protocol addresses allowed
        require(self.isWhitelisted(msg.target), "Target not in protocol whitelist");
        
        // Verify vault has enough assets
        require(self.totalAssets >= msg.amount, "ExecDelegate exceeds available assets");
        require(msg.amount > 0, "Cannot delegate zero amount");
        
        self.totalAssets = self.totalAssets - msg.amount;
        send(SendParameters{
            to: msg.target,
            value: msg.amount,
            mode: msg.mode,
            bounce: true, // Bounce on failure instead of losing funds
            body: msg.payload
        });
    }

    // Bounced ExecDelegate: recover totalAssets accounting
    receive("ExecDelegateBounced") {
        // If a delegated execution bounces, we re-add the value to totalAssets
        let ctx: Context = context();
        self.totalAssets = self.totalAssets + ctx.value;
    }

    // --- WHITELIST MANAGEMENT (owner only) ---

    receive(msg: SetWhitelist) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.index >= 1 && msg.index <= 5, "Whitelist index must be 1-5");
        
        if (msg.index == 1) { self.whitelist1 = msg.target; }
        if (msg.index == 2) { self.whitelist2 = msg.target; }
        if (msg.index == 3) { self.whitelist3 = msg.target; }
        if (msg.index == 4) { self.whitelist4 = msg.target; }
        if (msg.index == 5) { self.whitelist5 = msg.target; }

        if (msg.index > self.whitelistCount) {
            self.whitelistCount = msg.index;
        }
    }

    // --- JETTON MASTER COMPLIANCE FUNCTIONS ---

    fun mintTokens(to: Address, amount: Int, response_destination: Address?) {
        require(self.mintable, "Mint is disabled");
        let init: StateInit = initOf NeuroJettonWallet(myAddress(), to);
        let walletAddress: Address = contractAddress(init);

        send(SendParameters{
            to: walletAddress, 
            value: ton("0.05"), // Forward mint payload gas
            mode: SendIgnoreErrors,
            bounce: false,
            body: TokenTransferInternal{
                queryId: 0,
                amount: amount,
                from: myAddress(),
                response_destination: response_destination,
                forward_ton_amount: 0,
                forward_payload: emptySlice()
            }.toCell(),
            code: init.code,
            data: init.data
        });
    }

    receive("StopMint") {
        require(context().sender == self.owner, "Not owner");
        self.mintable = false;
    }

    receive(msg: ProvideWalletAddress) {
        let ctx: Context = context();
        let init: StateInit = initOf NeuroJettonWallet(myAddress(), msg.owner_address);
        let walletAddress: Address = contractAddress(init);

        let owner_address: Address? = null;
        if (msg.include_address) {
            owner_address = msg.owner_address;
        }

        send(SendParameters{
            to: ctx.sender,
            value: 0,
            mode: SendRemainingValue,
            body: TakeWalletAddress{
                queryId: msg.queryId,
                wallet_address: walletAddress,
                owner_address: owner_address
            }.toCell()
        });
    }

    // Config adjustments (owner only)
    receive(msg: UpdateFee) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.performanceFeePrecise <= 3000, "Fee too high! Max 30% allowed");
        self.performanceFeePrecise = msg.performanceFeePrecise;
    }

    receive(msg: UpdateOperator) {
        require(context().sender == self.owner, "Not Owner");
        self.operator = msg.newOperator;
    }

    receive(msg: UpdateAutoCompoundCap) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.newCap <= 1000, "Cap too high! Max 10% per cycle");
        self.autoCompoundCap = msg.newCap;
    }

    // -- GETTERS (TEP-74 Standard) --

    get fun get_jetton_data(): JettonData {
        return JettonData{
            totalSupply: self.totalSupply,
            mintable: self.mintable,
            owner: self.owner,
            content: self.content,
            walletCode: (initOf NeuroJettonWallet(myAddress(), self.owner)).code
        };
    }

    get fun get_wallet_address(owner: Address): Address {
        let init: StateInit = initOf NeuroJettonWallet(myAddress(), owner);
        return contractAddress(init);
    }

    // NeuroTON custom getters
    get fun tvl(): Int { return self.totalAssets; }
    
    get fun operator(): Address { return self.operator; }
    
    get fun autoCompoundCap(): Int { return self.autoCompoundCap; }

    get fun whitelistCount(): Int { return self.whitelistCount; }

    fun reserveGas(): Int {
        return ton("0.05");
    }
}

struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}
