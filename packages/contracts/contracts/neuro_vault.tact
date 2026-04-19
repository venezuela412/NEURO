import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages.tact";
import "./neuro_jetton_wallet.tact";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  NeuroVault v3 — Hardened Jetton Master & Yield Vault                    ║
// ║                                                                          ║
// ║  Security patches applied:                                               ║
// ║  [1] First-depositor inflation attack → Virtual offset (ERC-4626 style) ║
// ║  [2] Flash-loan / same-block deposit-withdraw → Entry fee (0.1%)        ║
// ║  [3] ExecDelegateBounced spoofing → Replaced with Sync() + owner-only   ║
// ║  [4] Operator drain risk → Per-tx delegation cap (50% max)              ║
// ║  [5] SendIgnoreErrors on withdrawals → Fixed to mode 0                  ║
// ║  [6] totalAssets desync → Sync reconciliation function                  ║
// ║  [7] Emergency pause mechanism added                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// SECURITY CONSTANTS (virtual offset for ERC-4626 first-depositor protection)
// These add "phantom" shares/assets to all calculations, making share price
// manipulation prohibitively expensive. 1e6 nanoton = 0.001 TON cost to attack.
const VIRTUAL_SUPPLY: Int = 1000000;  // 1e6 nanoton of phantom shares
const VIRTUAL_ASSETS: Int = 1000000;  // 1e6 nanoton of phantom assets

contract NeuroVault with Deployable, OwnableTransferable {
    
    // ── Core ──
    owner: Address;
    operator: Address;

    // ── nTON Accounting ──
    totalSupply: Int as coins;
    totalAssets: Int as coins;
    
    // ── Security Limits ──
    performanceFeePrecise: Int as uint16;  // e.g. 2000 = 20%, max 3000 = 30%
    minDepositAmount: Int as coins;        // 3 TON min to prevent gas griefing
    autoCompoundCap: Int as uint16;        // Max profit % per compound cycle (500 = 5%)
    maxDelegatePercent: Int as uint16;     // [PATCH #4] Max % of TVL per ExecDelegate tx (5000 = 50%)
    depositFeePrecise: Int as uint16;      // [PATCH #2] Entry fee in bps (10 = 0.1%) anti-flash-loan

    // ── Emergency ──
    paused: Bool;                          // [PATCH #7] Emergency pause — blocks deposits & delegates

    // ── Protocol Whitelist (up to 5 addresses) ──
    whitelistCount: Int as uint8;
    whitelist1: Address;
    whitelist2: Address;
    whitelist3: Address;
    whitelist4: Address;
    whitelist5: Address;

    // ── Jetton Metadata ──
    content: Cell;
    mintable: Bool;

    init(owner: Address, content: Cell) {
        self.owner = owner;
        self.operator = owner; 
        self.totalSupply = 0;
        self.totalAssets = 0;
        self.performanceFeePrecise = 2000;    // 20% performance fee
        self.minDepositAmount = ton("3.0");
        self.autoCompoundCap = 500;           // 5% max per compound
        self.maxDelegatePercent = 5000;        // 50% max per delegation tx
        self.depositFeePrecise = 10;           // 0.1% entry fee (anti-flash-loan)
        self.paused = false;
        self.content = content;
        self.mintable = true;

        self.whitelistCount = 0;
        self.whitelist1 = newAddress(0, 0);
        self.whitelist2 = newAddress(0, 0);
        self.whitelist3 = newAddress(0, 0);
        self.whitelist4 = newAddress(0, 0);
        self.whitelist5 = newAddress(0, 0);
    }

    // ── Access Control ──

    fun requireOwnerOrOperator() {
        let ctx: Context = context();
        require(ctx.sender == self.owner || ctx.sender == self.operator, "Not owner or operator");
    }

    fun requireNotPaused() {
        require(!self.paused, "Vault is paused");
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

    // ═══════════════════════════════════════════════════════
    // 1. DEPOSIT — Mint nTON for deposited TON
    // ═══════════════════════════════════════════════════════
    // 
    // Security: Virtual offset prevents first-depositor share manipulation.
    // Security: Entry fee makes flash-loan attacks unprofitable.
    //
    receive(msg: Deposit) {
        self.requireNotPaused();
        let ctx: Context = context();
        let depositVal: Int = ctx.value;
        
        // [CHECK] Minimum deposit enforced
        require(depositVal >= self.minDepositAmount, "Below minimum deposit (3 TON)");
        
        // [CHECK] Gas buffer
        require(depositVal > self.reserveGas(), "Insufficient TON for gas");
        let netDeposit: Int = depositVal - self.reserveGas();

        // ── [PATCH #2] Anti-flash-loan entry fee ──
        // Fee stays in vault as totalAssets, benefiting existing holders.
        // Makes same-block deposit-withdraw unprofitable (0.1% cost > any 1-block yield).
        let entryFee: Int = (netDeposit * self.depositFeePrecise) / 10000;
        let depositAfterFee: Int = netDeposit - entryFee;

        // ── [PATCH #1] Virtual offset (ERC-4626) for share calculation ──
        // Prevents first-depositor inflation attack by adding phantom supply/assets
        // to all calculations. Cost to manipulate = VIRTUAL_ASSETS * desired_ratio.
        let effectiveSupply: Int = self.totalSupply + VIRTUAL_SUPPLY;
        let effectiveAssets: Int = self.totalAssets + VIRTUAL_ASSETS;

        let sharesToMint: Int = (depositAfterFee * effectiveSupply) / effectiveAssets;

        // [CHECK] Prevent zero-share minting (rounding dust attack)
        require(sharesToMint > 0, "Deposit too small to mint shares");

        // Update state AFTER all checks (Checks-Effects-Interactions pattern)
        self.totalAssets = self.totalAssets + netDeposit; // Full deposit (including fee) goes to assets
        self.totalSupply = self.totalSupply + sharesToMint;

        // Mint nTON to depositor
        self.mintTokens(ctx.sender, sharesToMint, ctx.sender);
    }

    // ═══════════════════════════════════════════════════════
    // 2. WITHDRAWAL — Burn nTON, receive TON
    // ═══════════════════════════════════════════════════════
    //
    // Withdrawals are ALWAYS allowed, even when paused (user safety first).
    // [PATCH #5] Fixed send mode from SendIgnoreErrors to mode 0.
    //
    receive(msg: TokenBurnNotification) {
        let ctx: Context = context();
        
        // [CHECK] Only the legitimate jetton wallet can send burn notifications
        let expectedWallet: Address = contractAddress(initOf NeuroJettonWallet(myAddress(), msg.sender));
        require(ctx.sender == expectedWallet, "Invalid burn sender");

        require(msg.amount > 0, "Cannot burn zero");
        require(self.totalSupply >= msg.amount, "Burn exceeds supply");

        // ── [PATCH #1] Virtual offset withdrawal calculation ──
        // Same offset used in deposit — ensures consistent share pricing.
        let effectiveSupply: Int = self.totalSupply + VIRTUAL_SUPPLY;
        let effectiveAssets: Int = self.totalAssets + VIRTUAL_ASSETS;

        let tonToRelease: Int = (msg.amount * effectiveAssets) / effectiveSupply;
        require(tonToRelease > 0, "Withdrawal too small");

        // Cap the release to actual totalAssets (virtual assets are phantom)
        if (tonToRelease > self.totalAssets) {
            tonToRelease = self.totalAssets;
        }

        // [CHECK] Solvency — vault must have enough real assets
        require(self.totalAssets >= tonToRelease, "Insufficient vault assets");

        // Effects BEFORE interactions (CEI pattern)
        self.totalSupply = self.totalSupply - msg.amount;
        self.totalAssets = self.totalAssets - tonToRelease;

        let dest: Address = msg.sender;
        if (msg.response_destination != null) {
            dest = msg.response_destination!!;
        }

        // [PATCH #5] Send TON back — mode 0 (not SendIgnoreErrors)
        // bounce: true ensures funds return to vault if dest is invalid
        send(SendParameters{
            to: dest, 
            value: tonToRelease,
            mode: 0,
            bounce: true,
            body: "nTON Withdrawal".asComment()
        });
    }

    // ═══════════════════════════════════════════════════════
    // 3. YIELD RECEPTION — Passive income increases nTON price
    // ═══════════════════════════════════════════════════════
    //
    // Only whitelisted protocols (Tonstakers, STON.fi) or operator can send yield.
    // totalAssets goes up, totalSupply stays same → nTON price increases.
    //
    receive() {
        let ctx: Context = context();
        require(
            self.isWhitelisted(ctx.sender) || ctx.sender == self.operator,
            "Yield only from whitelisted sources"
        );
        self.totalAssets = self.totalAssets + ctx.value;
    }

    // ═══════════════════════════════════════════════════════
    // 4. AUTO-COMPOUND — Mint performance fee shares
    // ═══════════════════════════════════════════════════════
    //
    // Operator reports profit, vault mints fee shares to owner.
    // Capped at autoCompoundCap% of TVL per cycle to limit damage.
    //
    receive(msg: AutoCompound) {
        self.requireNotPaused();
        self.requireOwnerOrOperator();
        require(msg.profitToMint > 0, "No profit");

        // [CHECK] Profit cap per cycle
        let maxProfit: Int = (self.totalAssets * self.autoCompoundCap) / 10000;
        require(msg.profitToMint <= maxProfit, "Profit exceeds cycle cap");

        // Calculate owner's fee cut
        let ownerCut: Int = (msg.profitToMint * self.performanceFeePrecise) / 10000;
        
        // ── Virtual offset for fee share calculation ──
        let effectiveSupply: Int = self.totalSupply + VIRTUAL_SUPPLY;
        let effectiveAssets: Int = self.totalAssets + VIRTUAL_ASSETS;

        let sharesToMint: Int = (ownerCut * effectiveSupply) / effectiveAssets;
        require(sharesToMint > 0, "Fee too small to mint");
        
        self.totalSupply = self.totalSupply + sharesToMint;
        self.mintTokens(self.owner, sharesToMint, self.owner);
    }

    // ═══════════════════════════════════════════════════════
    // 5. EXEC DELEGATE — Zero-trust protocol execution
    // ═══════════════════════════════════════════════════════
    //
    // [PATCH #4] Per-tx delegation cap (default 50% of TVL).
    // Only whitelisted targets. Only owner/operator.
    //
    receive(msg: ExecDelegate) {
        self.requireNotPaused();
        self.requireOwnerOrOperator();
        
        // [CHECK] Only whitelisted protocol addresses
        require(self.isWhitelisted(msg.target), "Target not whitelisted");
        
        require(msg.amount > 0, "Zero delegation");
        require(self.totalAssets >= msg.amount, "Exceeds available assets");

        // ── [PATCH #4] Per-transaction delegation limit ──
        let maxDelegate: Int = (self.totalAssets * self.maxDelegatePercent) / 10000;
        require(msg.amount <= maxDelegate, "Exceeds per-tx delegation cap");
        
        self.totalAssets = self.totalAssets - msg.amount;
        send(SendParameters{
            to: msg.target,
            value: msg.amount,
            mode: msg.mode,
            bounce: true,
            body: msg.payload
        });
    }

    // ── [PATCH #3] REMOVED: "ExecDelegateBounced" text receiver ──
    // It was spoofable — anyone could send that text to inflate totalAssets.
    // Replaced by Sync() for owner-only reconciliation.

    // ═══════════════════════════════════════════════════════
    // 6. ADMIN: SYNC — Reconcile totalAssets with actual balance
    // ═══════════════════════════════════════════════════════
    //
    // [PATCH #6] Fixes totalAssets desync from bounced delegations,
    // direct TON transfers, or any other accounting drift.
    // Owner-only. Cannot be used to inflate — only corrects to myBalance().
    //
    receive("Sync") {
        require(context().sender == self.owner, "Not Owner");
        let currentBalance: Int = myBalance();
        let reserveNeeded: Int = self.reserveGas() + ton("0.01"); // small buffer
        if (currentBalance > reserveNeeded) {
            self.totalAssets = currentBalance - reserveNeeded;
        }
    }

    // ═══════════════════════════════════════════════════════
    // 7. EMERGENCY CONTROLS
    // ═══════════════════════════════════════════════════════
    //
    // [PATCH #7] Emergency pause — stops deposits, compounds, and delegations.
    // Withdrawals are ALWAYS allowed (user safety first).
    //
    receive("Pause") {
        require(context().sender == self.owner, "Not Owner");
        self.paused = true;
    }

    receive("Unpause") {
        require(context().sender == self.owner, "Not Owner");
        self.paused = false;
    }

    // ── WHITELIST MANAGEMENT (owner only) ──

    receive(msg: SetWhitelist) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.index >= 1 && msg.index <= 5, "Index 1-5");
        
        if (msg.index == 1) { self.whitelist1 = msg.target; }
        if (msg.index == 2) { self.whitelist2 = msg.target; }
        if (msg.index == 3) { self.whitelist3 = msg.target; }
        if (msg.index == 4) { self.whitelist4 = msg.target; }
        if (msg.index == 5) { self.whitelist5 = msg.target; }

        if (msg.index > self.whitelistCount) {
            self.whitelistCount = msg.index;
        }
    }

    // ═══════════════════════════════════════════════════════
    // JETTON MASTER COMPLIANCE (TEP-74)
    // ═══════════════════════════════════════════════════════

    fun mintTokens(to: Address, amount: Int, response_destination: Address?) {
        require(self.mintable, "Minting disabled");
        let init: StateInit = initOf NeuroJettonWallet(myAddress(), to);
        let walletAddress: Address = contractAddress(init);

        send(SendParameters{
            to: walletAddress, 
            value: ton("0.05"),
            mode: 0, // [PATCH #5] Not SendIgnoreErrors
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
        require(context().sender == self.owner, "Not Owner");
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

    // ── CONFIG (owner only) ──

    receive(msg: UpdateFee) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.performanceFeePrecise <= 3000, "Max 30%");
        self.performanceFeePrecise = msg.performanceFeePrecise;
    }

    receive(msg: UpdateOperator) {
        require(context().sender == self.owner, "Not Owner");
        self.operator = msg.newOperator;
    }

    receive(msg: UpdateAutoCompoundCap) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.newCap <= 1000, "Max 10%");
        self.autoCompoundCap = msg.newCap;
    }

    receive(msg: UpdateDelegateLimit) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.newLimit <= 8000, "Max 80%");
        self.maxDelegatePercent = msg.newLimit;
    }

    receive(msg: UpdateDepositFee) {
        require(context().sender == self.owner, "Not Owner");
        require(msg.newFee <= 100, "Max 1%");
        self.depositFeePrecise = msg.newFee;
    }

    // ═══════════════════════════════════════════════════════
    // GETTERS (TEP-74 Standard + Custom)
    // ═══════════════════════════════════════════════════════

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

    // Custom getters for frontend & monitoring
    get fun tvl(): Int { return self.totalAssets; }
    get fun operator(): Address { return self.operator; }
    get fun autoCompoundCap(): Int { return self.autoCompoundCap; }
    get fun whitelistCount(): Int { return self.whitelistCount; }
    get fun isPaused(): Bool { return self.paused; }
    get fun depositFee(): Int { return self.depositFeePrecise; }
    get fun maxDelegatePercent(): Int { return self.maxDelegatePercent; }

    // Share price getter: how much TON per 1 nTON (with 9 decimal precision)
    get fun sharePrice(): Int {
        if (self.totalSupply == 0) { return 1000000000; } // 1:1 at genesis
        return ((self.totalAssets + VIRTUAL_ASSETS) * 1000000000) / (self.totalSupply + VIRTUAL_SUPPLY);
    }

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
