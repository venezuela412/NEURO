import "@stdlib/deploy";
import "@stdlib/ownable";

message Deposit {
    // Deposit TON to get shares
}

message Withdraw {
    shares: Int as coins;
}

message Harvest {
    // Trigger auto-compounding (Only strategist/owner)
}

message UpdateFee {
    performanceFeePrecise: Int as uint16;
}

// Representing user balances safely inside the Vault mapping
contract NeuroVault with Deployable, OwnableTransferable {
    
    owner: Address;
    totalAssets: Int as coins;
    totalShares: Int as coins;
    sharesMap: map<Address, Int>;
    
    // Performance fee configuration. e.g. 2000 = 20.00%
    performanceFeePrecise: Int as uint16;

    init(owner: Address) {
        self.owner = owner;
        self.totalAssets = 0;
        self.totalShares = 0;
        self.performanceFeePrecise = 2000; 
    }

    receive(msg: Deposit) {
        let ctx: Context = context();
        let depositVal: Int = ctx.value;
        
        // 0.05 TON reserved for gas and storage.
        require(depositVal > reserveGas(), "Insufficient TON sent for deposit. Must cover gas.");
        let netDeposit: Int = depositVal - reserveGas();

        let sharesToMint: Int = 0;
        if (self.totalShares == 0 || self.totalAssets == 0) {
            sharesToMint = netDeposit;
        } else {
            sharesToMint = (netDeposit * self.totalShares) / self.totalAssets;
        }

        self.totalAssets = self.totalAssets + netDeposit;
        self.totalShares = self.totalShares + sharesToMint;
        
        let currentShares: Int = 0;
        if (self.sharesMap.get(ctx.sender) != null) {
            currentShares = self.sharesMap.get(ctx.sender)!!;
        }
        self.sharesMap.set(ctx.sender, currentShares + sharesToMint);

        // Any unspent gas mathematically stays in the contract providing a gas buffer for future Harvests.
        send(SendParameters{
            to: ctx.sender,
            value: ton("0.01"), 
            mode: SendIgnoreErrors, 
            body: "Deposit Successful".asComment()
        });
    }

    receive(msg: Withdraw) {
        let ctx: Context = context();
        require(msg.shares > 0, "Must withdraw more than 0 shares");
        
        let currentShares: Int = 0;
        if (self.sharesMap.get(ctx.sender) != null) {
            currentShares = self.sharesMap.get(ctx.sender)!!;
        }
        require(currentShares >= msg.shares, "Insufficient shares to withdraw");

        // Calculate underlying value
        let tonOut: Int = (msg.shares * self.totalAssets) / self.totalShares;
        
        // Update states
        self.sharesMap.set(ctx.sender, currentShares - msg.shares);
        self.totalShares = self.totalShares - msg.shares;
        self.totalAssets = self.totalAssets - tonOut;

        // Ensure we send exactly what they are owed, subtracting network transfer gas
        send(SendParameters{
            to: ctx.sender,
            value: tonOut, 
            mode: SendIgnoreErrors,
            body: "Withdrawal Successful".asComment()
        });
    }

    receive(msg: Harvest) {
        self.requireOwner(); // Access control: only our Control Plane can trigger harvest
        let ctx: Context = context();

        // In the future:
        // 1. the Vault sends a payload to STON.fi
        // 2. STON.fi executes yield strategy
        // 3. STON returns payload (bounced or successful)
        // 4. We calculate total increase in Vault TVL.
        // 5. If TVL increased, we take % performance fee by minting shares to the Owner.

        send(SendParameters{
            to: ctx.sender,
            value: 0,
            mode: SendRemainingValue | SendIgnoreErrors,
            body: "Harvest Initiated".asComment()
        });
    }

    receive(msg: UpdateFee) {
        self.requireOwner();
        require(msg.performanceFeePrecise <= 3000, "Fee too high! Max 30% allowed");
        self.performanceFeePrecise = msg.performanceFeePrecise;
    }

    // --- GETTERS ---
    get fun tvl(): Int {
        return self.totalAssets;
    }

    get fun userShares(user: Address): Int {
        if (self.sharesMap.get(user) != null) {
            return self.sharesMap.get(user)!!;
        }
        return 0;
    }
}

fun reserveGas(): Int {
    return ton("0.05"); // 0.05 TON fixed safe gas fee for standard operations
}
