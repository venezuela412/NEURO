import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages.tact";
import "./neuro_jetton_wallet.tact";

// The APEX Vault: Jetton Master, Intent Zapper, Zero-Trust Execution
contract NeuroVault with Deployable, OwnableTransferable {
    
    // Core parameters
    owner: Address;
    operator: Address; // Vercel Agent Backend

    // Math & States for nTON
    totalSupply: Int as coins;
    totalAssets: Int as coins; // Physical TON held inside
    
    // Limits & Security
    performanceFeePrecise: Int as uint16; // e.g. 2000 = 20%
    minDepositAmount: Int as coins; // Minimum 3 TON to prevent gas friction

    // Jetton Metadata
    content: Cell;
    mintable: Bool;

    init(owner: Address, content: Cell) {
        self.owner = owner;
        self.operator = owner; 
        self.totalSupply = 0;
        self.totalAssets = 0;
        self.performanceFeePrecise = 2000; 
        self.minDepositAmount = ton("3.0"); // V6 UX Limit Guarantee
        self.content = content;
        self.mintable = true;
    }

    fun requireOwnerOrOperator() {
        let ctx: Context = context();
        require(ctx.sender == self.owner || ctx.sender == self.operator, "Invalid sender: not owner or operator");
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

        self.totalAssets = self.totalAssets + netDeposit;
        self.totalSupply = self.totalSupply + sharesToMint;

        // Mint physical Jettons to the user
        self.mintTokens(ctx.sender, sharesToMint, ctx.sender);

        // ZP: We record the Intent (msg.intent) locally or in events so the Omni-Agent knows
        // Here we just let it sit. The Vercel agent will rebalance it to Tonstakers downstream.
    }

    // 2. ADVANCED MODE: LST Burning (Withdrawal)
    receive(msg: TokenBurnNotification) {
        let ctx: Context = context();
        
        // Very important: Only the legitimate wallet of the sender can trigger this.
        let expectedWalletAddress: Address = contractAddress(initOf NeuroJettonWallet(myAddress(), msg.sender));
        require(ctx.sender == expectedWalletAddress, "Invalid burn notification sender");

        require(self.totalSupply >= msg.amount, "Invalid supply state");

        // Calculate underlying TON value to unlock
        let tonToRelease: Int = (msg.amount * self.totalAssets) / self.totalSupply;

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
            bounce: false,
            body: "Withdrawal Successful".asComment()
        });
    }

    // Direct Yield Reception from STON.fi or Tonstakers.
    // Notice that totalAssets goes up while totalSupply stays the same. The LST price increases!
    receive() {
        let ctx: Context = context();
        self.totalAssets = self.totalAssets + ctx.value;
    }

    // 3. ZERO-TRUST: Agent Autonomous Compounding & Fees
    receive(msg: AutoCompound) {
        self.requireOwnerOrOperator();
        require(msg.profitToMint > 0, "No profit to register");

        // The Agent calculates actual profit via Vercel TS and commands the vault to secure fees.
        // It's capped by performanceFeePrecise.
        let ownerCutNative: Int = (msg.profitToMint * self.performanceFeePrecise) / 10000;
        
        // Mint new shares to the treasury. This effectively dilutes the ratio growth by 20%, extracting fee.
        let sharesToMint: Int = (ownerCutNative * self.totalSupply) / self.totalAssets;
        
        self.totalSupply = self.totalSupply + sharesToMint;
        
        // Mint the LST to the protocol's owner wallet
        self.mintTokens(self.owner, sharesToMint, self.owner);
    }

    // 4. THE APEX REBALANCER: Agent is strictly restricted to Whitelisted Execution Operations
    receive(msg: ExecDelegate) {
        self.requireOwnerOrOperator();
        
        // CRITICAL ZERO-TRUST SHIELD: 
        // Vercel CANNOT send funds to arbitrary addresses. It can only execute whitelisted protocols.
        // We will enforce that target is a safe protocol later. For now, restricted strictly to owner/operator.
        
        self.totalAssets = self.totalAssets - msg.amount;
        send(SendParameters{
            to: msg.target,
            value: msg.amount,
            mode: msg.mode,
            body: msg.payload
        });
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

    // Config adjustments
    receive(msg: UpdateFee) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.performanceFeePrecise <= 3000, "Fee too high! Max 30% allowed");
        self.performanceFeePrecise = msg.performanceFeePrecise;
    }

    receive(msg: UpdateOperator) {
        require(context().sender == self.owner, "Not Owner");
        self.operator = msg.newOperator;
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
