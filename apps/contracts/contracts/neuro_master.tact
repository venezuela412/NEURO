import "@stdlib/deploy";
import "./messages.tact";
import "./neuro_wallet.tact";

@interface("org.ton.jetton.master")
contract NeuroMaster with Deployable {
    total_supply: Int as coins;
    owner: Address;
    keeper: Address;
    paused: Bool;
    jetton_content: Cell;
    mintable: Bool;

    init(owner: Address, keeper: Address, jetton_content: Cell) {
        self.total_supply = 0;
        self.owner = owner;
        self.keeper = keeper;
        self.jetton_content = jetton_content;
        self.mintable = true;
        self.paused = false;
    }

    // ─── User Actions ───

    receive(msg: Deposit) {
        require(!self.paused, "Vault is paused");
        
        let ctx: Context = context();
        let value: Int = ctx.value;
        require(value > 100000000, "Deposit must be > 0.1 TON to cover fees");
        
        // Compute minted nTON (1:1 ratio for simplicity initially)
        let minted: Int = value - 50000000; // Deduct gas
        
        self.total_supply = self.total_supply + minted;

        let initCode: StateInit = initOf NeuroWallet(myAddress(), ctx.sender);
        
        // Send nTON to User Wallet, using a fixed 0.05 TON for gas, keeping the rest in the vault
        send(SendParameters{
            to: contractAddress(initCode),
            value: 50000000, // 0.05 TON
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
        
        self.total_supply = self.total_supply - msg.amount;

        // Send back TON to user
        send(SendParameters{
            to: msg.sender,
            value: msg.amount,
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

        send(SendParameters{
            to: msg.destination,
            value: msg.amount,
            mode: SendIgnoreErrors,
            bounce: false,
            body: "Rebalance".asComment()
        });
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

    get fun tvl(): Int {
        return self.total_supply; // Abstracted TVL mapped directly to supply for MVP
    }
}

struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}
