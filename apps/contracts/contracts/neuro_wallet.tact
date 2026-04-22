import "./messages.tact";

@interface("org.ton.jetton.wallet")
contract NeuroWallet {
    balance: Int as coins = 0;
    owner: Address;
    master: Address;

    init(master: Address, owner: Address) {
        self.balance = 0;
        self.owner = owner;
        self.master = master;
    }

    receive(msg: TokenTransfer) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Invalid sender");
        
        // Ensure enough balance
        self.balance = self.balance - msg.amount;
        require(self.balance >= 0, "Invalid balance");

        let fwdFee: Int = ctx.readForwardFee();
        let fwdCount: Int = 1;
        if (msg.forward_ton_amount > 0) {
            fwdCount = 2;
        }
        require(ctx.value > fwdCount * fwdFee + 20000000 + msg.forward_ton_amount, "Invalid value");

        let initCode: StateInit = initOf NeuroWallet(self.master, msg.destination);
        let walletAddress: Address = contractAddress(initCode);

        send(SendParameters{
            to: walletAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenTransferInternal{
                queryId: msg.queryId,
                amount: msg.amount,
                from: self.owner,
                response_destination: msg.response_destination,
                forward_ton_amount: msg.forward_ton_amount,
                forward_payload: msg.forward_payload
            }.toCell(),
            code: initCode.code,
            data: initCode.data
        });
    }

    receive(msg: TokenTransferInternal) {
        let ctx: Context = context();
        if (ctx.sender != self.master) {
            let initCode: StateInit = initOf NeuroWallet(self.master, msg.from);
            require(contractAddress(initCode) == ctx.sender, "Invalid sender");
        }

        self.balance = self.balance + msg.amount;
        require(self.balance >= 0, "Invalid balance");

        if (msg.forward_ton_amount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forward_ton_amount,
                mode: SendIgnoreErrors,
                bounce: false,
                body: TokenNotification{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    from: msg.from,
                    forward_payload: msg.forward_payload
                }.toCell()
            });
        }

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

    receive(msg: TokenBurn) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Invalid sender");
        
        self.balance = self.balance - msg.amount;
        require(self.balance >= 0, "Invalid balance");

        let fwdFee: Int = ctx.readForwardFee();
        require(ctx.value > fwdFee + 20000000, "Invalid value");

        send(SendParameters{
            to: self.master,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenBurnNotification{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: self.owner,
                response_destination: msg.response_destination
            }.toCell()
        });
    }

    // Bounce handlers
    bounced(src: bounced<TokenTransferInternal>) {
        self.balance = self.balance + src.amount;
    }

    bounced(src: bounced<TokenBurnNotification>) {
        self.balance = self.balance + src.amount;
    }

    get fun get_wallet_data(): JettonWalletData {
        return JettonWalletData{
            balance: self.balance,
            owner: self.owner,
            master: self.master,
            walletCode: (initOf NeuroWallet(self.master, self.owner)).code
        };
    }
}

struct JettonWalletData {
    balance: Int;
    owner: Address;
    master: Address;
    walletCode: Cell;
}
