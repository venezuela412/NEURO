import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type TokenTransfer = {
    $$type: 'TokenTransfer';
    queryId: bigint;
    amount: bigint;
    destination: Address;
    response_destination: Address | null;
    custom_payload: Cell | null;
    forward_ton_amount: bigint;
    forward_payload: Slice;
}

export function storeTokenTransfer(src: TokenTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(260734629, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTokenTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 260734629) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _response_destination = sc_0.loadMaybeAddress();
    const _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forward_ton_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'TokenTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadTupleTokenTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _response_destination = source.readAddressOpt();
    const _custom_payload = source.readCellOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleTokenTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _response_destination = source.readAddressOpt();
    const _custom_payload = source.readCellOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function storeTupleTokenTransfer(source: TokenTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserTokenTransfer(): DictionaryValue<TokenTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTokenTransfer(src.loadRef().beginParse());
        }
    }
}

export type TokenTransferInternal = {
    $$type: 'TokenTransferInternal';
    queryId: bigint;
    amount: bigint;
    from: Address;
    response_destination: Address | null;
    forward_ton_amount: bigint;
    forward_payload: Slice;
}

export function storeTokenTransferInternal(src: TokenTransferInternal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(395134233, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.from);
        b_0.storeAddress(src.response_destination);
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTokenTransferInternal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 395134233) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _from = sc_0.loadAddress();
    const _response_destination = sc_0.loadMaybeAddress();
    const _forward_ton_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'TokenTransferInternal' as const, queryId: _queryId, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadTupleTokenTransferInternal(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _response_destination = source.readAddressOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransferInternal' as const, queryId: _queryId, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleTokenTransferInternal(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _response_destination = source.readAddressOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenTransferInternal' as const, queryId: _queryId, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function storeTupleTokenTransferInternal(source: TokenTransferInternal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.from);
    builder.writeAddress(source.response_destination);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserTokenTransferInternal(): DictionaryValue<TokenTransferInternal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenTransferInternal(src)).endCell());
        },
        parse: (src) => {
            return loadTokenTransferInternal(src.loadRef().beginParse());
        }
    }
}

export type TokenNotification = {
    $$type: 'TokenNotification';
    queryId: bigint;
    amount: bigint;
    from: Address;
    forward_payload: Slice;
}

export function storeTokenNotification(src: TokenNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1935855772, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.from);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTokenNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1935855772) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _from = sc_0.loadAddress();
    const _forward_payload = sc_0;
    return { $$type: 'TokenNotification' as const, queryId: _queryId, amount: _amount, from: _from, forward_payload: _forward_payload };
}

export function loadTupleTokenNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenNotification' as const, queryId: _queryId, amount: _amount, from: _from, forward_payload: _forward_payload };
}

export function loadGetterTupleTokenNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'TokenNotification' as const, queryId: _queryId, amount: _amount, from: _from, forward_payload: _forward_payload };
}

export function storeTupleTokenNotification(source: TokenNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.from);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserTokenNotification(): DictionaryValue<TokenNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenNotification(src)).endCell());
        },
        parse: (src) => {
            return loadTokenNotification(src.loadRef().beginParse());
        }
    }
}

export type TokenBurn = {
    $$type: 'TokenBurn';
    queryId: bigint;
    amount: bigint;
    response_destination: Address | null;
    custom_payload: Cell | null;
}

export function storeTokenBurn(src: TokenBurn) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1499400124, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
    };
}

export function loadTokenBurn(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1499400124) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _response_destination = sc_0.loadMaybeAddress();
    const _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'TokenBurn' as const, queryId: _queryId, amount: _amount, response_destination: _response_destination, custom_payload: _custom_payload };
}

export function loadTupleTokenBurn(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _response_destination = source.readAddressOpt();
    const _custom_payload = source.readCellOpt();
    return { $$type: 'TokenBurn' as const, queryId: _queryId, amount: _amount, response_destination: _response_destination, custom_payload: _custom_payload };
}

export function loadGetterTupleTokenBurn(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _response_destination = source.readAddressOpt();
    const _custom_payload = source.readCellOpt();
    return { $$type: 'TokenBurn' as const, queryId: _queryId, amount: _amount, response_destination: _response_destination, custom_payload: _custom_payload };
}

export function storeTupleTokenBurn(source: TokenBurn) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    return builder.build();
}

export function dictValueParserTokenBurn(): DictionaryValue<TokenBurn> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenBurn(src)).endCell());
        },
        parse: (src) => {
            return loadTokenBurn(src.loadRef().beginParse());
        }
    }
}

export type TokenBurnNotification = {
    $$type: 'TokenBurnNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    response_destination: Address | null;
}

export function storeTokenBurnNotification(src: TokenBurnNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2078119902, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.response_destination);
    };
}

export function loadTokenBurnNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2078119902) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _response_destination = sc_0.loadMaybeAddress();
    return { $$type: 'TokenBurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, response_destination: _response_destination };
}

export function loadTupleTokenBurnNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _response_destination = source.readAddressOpt();
    return { $$type: 'TokenBurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, response_destination: _response_destination };
}

export function loadGetterTupleTokenBurnNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _response_destination = source.readAddressOpt();
    return { $$type: 'TokenBurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, response_destination: _response_destination };
}

export function storeTupleTokenBurnNotification(source: TokenBurnNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeAddress(source.response_destination);
    return builder.build();
}

export function dictValueParserTokenBurnNotification(): DictionaryValue<TokenBurnNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenBurnNotification(src)).endCell());
        },
        parse: (src) => {
            return loadTokenBurnNotification(src.loadRef().beginParse());
        }
    }
}

export type ProvideWalletAddress = {
    $$type: 'ProvideWalletAddress';
    queryId: bigint;
    owner_address: Address;
    include_address: boolean;
}

export function storeProvideWalletAddress(src: ProvideWalletAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(745978227, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.owner_address);
        b_0.storeBit(src.include_address);
    };
}

export function loadProvideWalletAddress(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 745978227) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _owner_address = sc_0.loadAddress();
    const _include_address = sc_0.loadBit();
    return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, owner_address: _owner_address, include_address: _include_address };
}

export function loadTupleProvideWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _owner_address = source.readAddress();
    const _include_address = source.readBoolean();
    return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, owner_address: _owner_address, include_address: _include_address };
}

export function loadGetterTupleProvideWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _owner_address = source.readAddress();
    const _include_address = source.readBoolean();
    return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, owner_address: _owner_address, include_address: _include_address };
}

export function storeTupleProvideWalletAddress(source: ProvideWalletAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.owner_address);
    builder.writeBoolean(source.include_address);
    return builder.build();
}

export function dictValueParserProvideWalletAddress(): DictionaryValue<ProvideWalletAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideWalletAddress(src)).endCell());
        },
        parse: (src) => {
            return loadProvideWalletAddress(src.loadRef().beginParse());
        }
    }
}

export type TakeWalletAddress = {
    $$type: 'TakeWalletAddress';
    queryId: bigint;
    wallet_address: Address;
    owner_address: Address | null;
}

export function storeTakeWalletAddress(src: TakeWalletAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3513996288, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.wallet_address);
        b_0.storeAddress(src.owner_address);
    };
}

export function loadTakeWalletAddress(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3513996288) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _wallet_address = sc_0.loadAddress();
    const _owner_address = sc_0.loadMaybeAddress();
    return { $$type: 'TakeWalletAddress' as const, queryId: _queryId, wallet_address: _wallet_address, owner_address: _owner_address };
}

export function loadTupleTakeWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _wallet_address = source.readAddress();
    const _owner_address = source.readAddressOpt();
    return { $$type: 'TakeWalletAddress' as const, queryId: _queryId, wallet_address: _wallet_address, owner_address: _owner_address };
}

export function loadGetterTupleTakeWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _wallet_address = source.readAddress();
    const _owner_address = source.readAddressOpt();
    return { $$type: 'TakeWalletAddress' as const, queryId: _queryId, wallet_address: _wallet_address, owner_address: _owner_address };
}

export function storeTupleTakeWalletAddress(source: TakeWalletAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.wallet_address);
    builder.writeAddress(source.owner_address);
    return builder.build();
}

export function dictValueParserTakeWalletAddress(): DictionaryValue<TakeWalletAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTakeWalletAddress(src)).endCell());
        },
        parse: (src) => {
            return loadTakeWalletAddress(src.loadRef().beginParse());
        }
    }
}

export type Deposit = {
    $$type: 'Deposit';
    intent: bigint;
}

export function storeDeposit(src: Deposit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2393262120, 32);
        b_0.storeUint(src.intent, 8);
    };
}

export function loadDeposit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2393262120) { throw Error('Invalid prefix'); }
    const _intent = sc_0.loadUintBig(8);
    return { $$type: 'Deposit' as const, intent: _intent };
}

export function loadTupleDeposit(source: TupleReader) {
    const _intent = source.readBigNumber();
    return { $$type: 'Deposit' as const, intent: _intent };
}

export function loadGetterTupleDeposit(source: TupleReader) {
    const _intent = source.readBigNumber();
    return { $$type: 'Deposit' as const, intent: _intent };
}

export function storeTupleDeposit(source: Deposit) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.intent);
    return builder.build();
}

export function dictValueParserDeposit(): DictionaryValue<Deposit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeposit(src)).endCell());
        },
        parse: (src) => {
            return loadDeposit(src.loadRef().beginParse());
        }
    }
}

export type RequestWithdrawal = {
    $$type: 'RequestWithdrawal';
    amount: bigint;
}

export function storeRequestWithdrawal(src: RequestWithdrawal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3936006414, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadRequestWithdrawal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3936006414) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'RequestWithdrawal' as const, amount: _amount };
}

export function loadTupleRequestWithdrawal(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'RequestWithdrawal' as const, amount: _amount };
}

export function loadGetterTupleRequestWithdrawal(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'RequestWithdrawal' as const, amount: _amount };
}

export function storeTupleRequestWithdrawal(source: RequestWithdrawal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserRequestWithdrawal(): DictionaryValue<RequestWithdrawal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRequestWithdrawal(src)).endCell());
        },
        parse: (src) => {
            return loadRequestWithdrawal(src.loadRef().beginParse());
        }
    }
}

export type AutoCompound = {
    $$type: 'AutoCompound';
    profitToMint: bigint;
}

export function storeAutoCompound(src: AutoCompound) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3924287516, 32);
        b_0.storeCoins(src.profitToMint);
    };
}

export function loadAutoCompound(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3924287516) { throw Error('Invalid prefix'); }
    const _profitToMint = sc_0.loadCoins();
    return { $$type: 'AutoCompound' as const, profitToMint: _profitToMint };
}

export function loadTupleAutoCompound(source: TupleReader) {
    const _profitToMint = source.readBigNumber();
    return { $$type: 'AutoCompound' as const, profitToMint: _profitToMint };
}

export function loadGetterTupleAutoCompound(source: TupleReader) {
    const _profitToMint = source.readBigNumber();
    return { $$type: 'AutoCompound' as const, profitToMint: _profitToMint };
}

export function storeTupleAutoCompound(source: AutoCompound) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.profitToMint);
    return builder.build();
}

export function dictValueParserAutoCompound(): DictionaryValue<AutoCompound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAutoCompound(src)).endCell());
        },
        parse: (src) => {
            return loadAutoCompound(src.loadRef().beginParse());
        }
    }
}

export type ExecDelegate = {
    $$type: 'ExecDelegate';
    target: Address;
    amount: bigint;
    mode: bigint;
    payload: Cell | null;
}

export function storeExecDelegate(src: ExecDelegate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1258179490, 32);
        b_0.storeAddress(src.target);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.mode, 8);
        if (src.payload !== null && src.payload !== undefined) { b_0.storeBit(true).storeRef(src.payload); } else { b_0.storeBit(false); }
    };
}

export function loadExecDelegate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1258179490) { throw Error('Invalid prefix'); }
    const _target = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _mode = sc_0.loadUintBig(8);
    const _payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'ExecDelegate' as const, target: _target, amount: _amount, mode: _mode, payload: _payload };
}

export function loadTupleExecDelegate(source: TupleReader) {
    const _target = source.readAddress();
    const _amount = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _payload = source.readCellOpt();
    return { $$type: 'ExecDelegate' as const, target: _target, amount: _amount, mode: _mode, payload: _payload };
}

export function loadGetterTupleExecDelegate(source: TupleReader) {
    const _target = source.readAddress();
    const _amount = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _payload = source.readCellOpt();
    return { $$type: 'ExecDelegate' as const, target: _target, amount: _amount, mode: _mode, payload: _payload };
}

export function storeTupleExecDelegate(source: ExecDelegate) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.target);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.mode);
    builder.writeCell(source.payload);
    return builder.build();
}

export function dictValueParserExecDelegate(): DictionaryValue<ExecDelegate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeExecDelegate(src)).endCell());
        },
        parse: (src) => {
            return loadExecDelegate(src.loadRef().beginParse());
        }
    }
}

export type UpdateFee = {
    $$type: 'UpdateFee';
    performanceFeePrecise: bigint;
}

export function storeUpdateFee(src: UpdateFee) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3144592497, 32);
        b_0.storeUint(src.performanceFeePrecise, 16);
    };
}

export function loadUpdateFee(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3144592497) { throw Error('Invalid prefix'); }
    const _performanceFeePrecise = sc_0.loadUintBig(16);
    return { $$type: 'UpdateFee' as const, performanceFeePrecise: _performanceFeePrecise };
}

export function loadTupleUpdateFee(source: TupleReader) {
    const _performanceFeePrecise = source.readBigNumber();
    return { $$type: 'UpdateFee' as const, performanceFeePrecise: _performanceFeePrecise };
}

export function loadGetterTupleUpdateFee(source: TupleReader) {
    const _performanceFeePrecise = source.readBigNumber();
    return { $$type: 'UpdateFee' as const, performanceFeePrecise: _performanceFeePrecise };
}

export function storeTupleUpdateFee(source: UpdateFee) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.performanceFeePrecise);
    return builder.build();
}

export function dictValueParserUpdateFee(): DictionaryValue<UpdateFee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateFee(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateFee(src.loadRef().beginParse());
        }
    }
}

export type UpdateOperator = {
    $$type: 'UpdateOperator';
    newOperator: Address;
}

export function storeUpdateOperator(src: UpdateOperator) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1643308500, 32);
        b_0.storeAddress(src.newOperator);
    };
}

export function loadUpdateOperator(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1643308500) { throw Error('Invalid prefix'); }
    const _newOperator = sc_0.loadAddress();
    return { $$type: 'UpdateOperator' as const, newOperator: _newOperator };
}

export function loadTupleUpdateOperator(source: TupleReader) {
    const _newOperator = source.readAddress();
    return { $$type: 'UpdateOperator' as const, newOperator: _newOperator };
}

export function loadGetterTupleUpdateOperator(source: TupleReader) {
    const _newOperator = source.readAddress();
    return { $$type: 'UpdateOperator' as const, newOperator: _newOperator };
}

export function storeTupleUpdateOperator(source: UpdateOperator) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newOperator);
    return builder.build();
}

export function dictValueParserUpdateOperator(): DictionaryValue<UpdateOperator> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateOperator(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateOperator(src.loadRef().beginParse());
        }
    }
}

export type SetWhitelist = {
    $$type: 'SetWhitelist';
    index: bigint;
    target: Address;
}

export function storeSetWhitelist(src: SetWhitelist) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(993790908, 32);
        b_0.storeUint(src.index, 8);
        b_0.storeAddress(src.target);
    };
}

export function loadSetWhitelist(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 993790908) { throw Error('Invalid prefix'); }
    const _index = sc_0.loadUintBig(8);
    const _target = sc_0.loadAddress();
    return { $$type: 'SetWhitelist' as const, index: _index, target: _target };
}

export function loadTupleSetWhitelist(source: TupleReader) {
    const _index = source.readBigNumber();
    const _target = source.readAddress();
    return { $$type: 'SetWhitelist' as const, index: _index, target: _target };
}

export function loadGetterTupleSetWhitelist(source: TupleReader) {
    const _index = source.readBigNumber();
    const _target = source.readAddress();
    return { $$type: 'SetWhitelist' as const, index: _index, target: _target };
}

export function storeTupleSetWhitelist(source: SetWhitelist) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.index);
    builder.writeAddress(source.target);
    return builder.build();
}

export function dictValueParserSetWhitelist(): DictionaryValue<SetWhitelist> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetWhitelist(src)).endCell());
        },
        parse: (src) => {
            return loadSetWhitelist(src.loadRef().beginParse());
        }
    }
}

export type UpdateAutoCompoundCap = {
    $$type: 'UpdateAutoCompoundCap';
    newCap: bigint;
}

export function storeUpdateAutoCompoundCap(src: UpdateAutoCompoundCap) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(927790173, 32);
        b_0.storeUint(src.newCap, 16);
    };
}

export function loadUpdateAutoCompoundCap(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 927790173) { throw Error('Invalid prefix'); }
    const _newCap = sc_0.loadUintBig(16);
    return { $$type: 'UpdateAutoCompoundCap' as const, newCap: _newCap };
}

export function loadTupleUpdateAutoCompoundCap(source: TupleReader) {
    const _newCap = source.readBigNumber();
    return { $$type: 'UpdateAutoCompoundCap' as const, newCap: _newCap };
}

export function loadGetterTupleUpdateAutoCompoundCap(source: TupleReader) {
    const _newCap = source.readBigNumber();
    return { $$type: 'UpdateAutoCompoundCap' as const, newCap: _newCap };
}

export function storeTupleUpdateAutoCompoundCap(source: UpdateAutoCompoundCap) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newCap);
    return builder.build();
}

export function dictValueParserUpdateAutoCompoundCap(): DictionaryValue<UpdateAutoCompoundCap> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateAutoCompoundCap(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateAutoCompoundCap(src.loadRef().beginParse());
        }
    }
}

export type SwapAdditionalData = {
    $$type: 'SwapAdditionalData';
    minOut: bigint;
    receiverAddress: Address;
    fwdGas: bigint;
    customPayload: Cell | null;
}

export function storeSwapAdditionalData(src: SwapAdditionalData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.minOut);
        b_0.storeAddress(src.receiverAddress);
        b_0.storeCoins(src.fwdGas);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
    };
}

export function loadSwapAdditionalData(slice: Slice) {
    const sc_0 = slice;
    const _minOut = sc_0.loadCoins();
    const _receiverAddress = sc_0.loadAddress();
    const _fwdGas = sc_0.loadCoins();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SwapAdditionalData' as const, minOut: _minOut, receiverAddress: _receiverAddress, fwdGas: _fwdGas, customPayload: _customPayload };
}

export function loadTupleSwapAdditionalData(source: TupleReader) {
    const _minOut = source.readBigNumber();
    const _receiverAddress = source.readAddress();
    const _fwdGas = source.readBigNumber();
    const _customPayload = source.readCellOpt();
    return { $$type: 'SwapAdditionalData' as const, minOut: _minOut, receiverAddress: _receiverAddress, fwdGas: _fwdGas, customPayload: _customPayload };
}

export function loadGetterTupleSwapAdditionalData(source: TupleReader) {
    const _minOut = source.readBigNumber();
    const _receiverAddress = source.readAddress();
    const _fwdGas = source.readBigNumber();
    const _customPayload = source.readCellOpt();
    return { $$type: 'SwapAdditionalData' as const, minOut: _minOut, receiverAddress: _receiverAddress, fwdGas: _fwdGas, customPayload: _customPayload };
}

export function storeTupleSwapAdditionalData(source: SwapAdditionalData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.minOut);
    builder.writeAddress(source.receiverAddress);
    builder.writeNumber(source.fwdGas);
    builder.writeCell(source.customPayload);
    return builder.build();
}

export function dictValueParserSwapAdditionalData(): DictionaryValue<SwapAdditionalData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSwapAdditionalData(src)).endCell());
        },
        parse: (src) => {
            return loadSwapAdditionalData(src.loadRef().beginParse());
        }
    }
}

export type StonfiSwap = {
    $$type: 'StonfiSwap';
    otherTokenWallet: Address;
    refundAddress: Address;
    excessesAddress: Address;
    deadline: bigint;
    additionalData: SwapAdditionalData;
}

export function storeStonfiSwap(src: StonfiSwap) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1717886506, 32);
        b_0.storeAddress(src.otherTokenWallet);
        b_0.storeAddress(src.refundAddress);
        b_0.storeAddress(src.excessesAddress);
        b_0.storeUint(src.deadline, 64);
        const b_1 = new Builder();
        b_1.store(storeSwapAdditionalData(src.additionalData));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStonfiSwap(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1717886506) { throw Error('Invalid prefix'); }
    const _otherTokenWallet = sc_0.loadAddress();
    const _refundAddress = sc_0.loadAddress();
    const _excessesAddress = sc_0.loadAddress();
    const _deadline = sc_0.loadUintBig(64);
    const sc_1 = sc_0.loadRef().beginParse();
    const _additionalData = loadSwapAdditionalData(sc_1);
    return { $$type: 'StonfiSwap' as const, otherTokenWallet: _otherTokenWallet, refundAddress: _refundAddress, excessesAddress: _excessesAddress, deadline: _deadline, additionalData: _additionalData };
}

export function loadTupleStonfiSwap(source: TupleReader) {
    const _otherTokenWallet = source.readAddress();
    const _refundAddress = source.readAddress();
    const _excessesAddress = source.readAddress();
    const _deadline = source.readBigNumber();
    const _additionalData = loadTupleSwapAdditionalData(source);
    return { $$type: 'StonfiSwap' as const, otherTokenWallet: _otherTokenWallet, refundAddress: _refundAddress, excessesAddress: _excessesAddress, deadline: _deadline, additionalData: _additionalData };
}

export function loadGetterTupleStonfiSwap(source: TupleReader) {
    const _otherTokenWallet = source.readAddress();
    const _refundAddress = source.readAddress();
    const _excessesAddress = source.readAddress();
    const _deadline = source.readBigNumber();
    const _additionalData = loadGetterTupleSwapAdditionalData(source);
    return { $$type: 'StonfiSwap' as const, otherTokenWallet: _otherTokenWallet, refundAddress: _refundAddress, excessesAddress: _excessesAddress, deadline: _deadline, additionalData: _additionalData };
}

export function storeTupleStonfiSwap(source: StonfiSwap) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.otherTokenWallet);
    builder.writeAddress(source.refundAddress);
    builder.writeAddress(source.excessesAddress);
    builder.writeNumber(source.deadline);
    builder.writeTuple(storeTupleSwapAdditionalData(source.additionalData));
    return builder.build();
}

export function dictValueParserStonfiSwap(): DictionaryValue<StonfiSwap> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStonfiSwap(src)).endCell());
        },
        parse: (src) => {
            return loadStonfiSwap(src.loadRef().beginParse());
        }
    }
}

export type StonfiProvideLiquidity = {
    $$type: 'StonfiProvideLiquidity';
    otherTokenWallet: Address;
    refundAddress: Address;
    excessesAddress: Address;
    deadline: bigint;
    minLpOut: bigint;
}

export function storeStonfiProvideLiquidity(src: StonfiProvideLiquidity) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3351079513, 32);
        b_0.storeAddress(src.otherTokenWallet);
        b_0.storeAddress(src.refundAddress);
        b_0.storeAddress(src.excessesAddress);
        b_0.storeUint(src.deadline, 64);
        b_0.storeCoins(src.minLpOut);
    };
}

export function loadStonfiProvideLiquidity(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3351079513) { throw Error('Invalid prefix'); }
    const _otherTokenWallet = sc_0.loadAddress();
    const _refundAddress = sc_0.loadAddress();
    const _excessesAddress = sc_0.loadAddress();
    const _deadline = sc_0.loadUintBig(64);
    const _minLpOut = sc_0.loadCoins();
    return { $$type: 'StonfiProvideLiquidity' as const, otherTokenWallet: _otherTokenWallet, refundAddress: _refundAddress, excessesAddress: _excessesAddress, deadline: _deadline, minLpOut: _minLpOut };
}

export function loadTupleStonfiProvideLiquidity(source: TupleReader) {
    const _otherTokenWallet = source.readAddress();
    const _refundAddress = source.readAddress();
    const _excessesAddress = source.readAddress();
    const _deadline = source.readBigNumber();
    const _minLpOut = source.readBigNumber();
    return { $$type: 'StonfiProvideLiquidity' as const, otherTokenWallet: _otherTokenWallet, refundAddress: _refundAddress, excessesAddress: _excessesAddress, deadline: _deadline, minLpOut: _minLpOut };
}

export function loadGetterTupleStonfiProvideLiquidity(source: TupleReader) {
    const _otherTokenWallet = source.readAddress();
    const _refundAddress = source.readAddress();
    const _excessesAddress = source.readAddress();
    const _deadline = source.readBigNumber();
    const _minLpOut = source.readBigNumber();
    return { $$type: 'StonfiProvideLiquidity' as const, otherTokenWallet: _otherTokenWallet, refundAddress: _refundAddress, excessesAddress: _excessesAddress, deadline: _deadline, minLpOut: _minLpOut };
}

export function storeTupleStonfiProvideLiquidity(source: StonfiProvideLiquidity) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.otherTokenWallet);
    builder.writeAddress(source.refundAddress);
    builder.writeAddress(source.excessesAddress);
    builder.writeNumber(source.deadline);
    builder.writeNumber(source.minLpOut);
    return builder.build();
}

export function dictValueParserStonfiProvideLiquidity(): DictionaryValue<StonfiProvideLiquidity> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStonfiProvideLiquidity(src)).endCell());
        },
        parse: (src) => {
            return loadStonfiProvideLiquidity(src.loadRef().beginParse());
        }
    }
}

export type NeuroJettonWallet$Data = {
    $$type: 'NeuroJettonWallet$Data';
    balance: bigint;
    owner: Address;
    master: Address;
}

export function storeNeuroJettonWallet$Data(src: NeuroJettonWallet$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.balance, 257);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
    };
}

export function loadNeuroJettonWallet$Data(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadIntBig(257);
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    return { $$type: 'NeuroJettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadTupleNeuroJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'NeuroJettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadGetterTupleNeuroJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'NeuroJettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function storeTupleNeuroJettonWallet$Data(source: NeuroJettonWallet$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    return builder.build();
}

export function dictValueParserNeuroJettonWallet$Data(): DictionaryValue<NeuroJettonWallet$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNeuroJettonWallet$Data(src)).endCell());
        },
        parse: (src) => {
            return loadNeuroJettonWallet$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonWalletData = {
    $$type: 'JettonWalletData';
    balance: bigint;
    owner: Address;
    master: Address;
    walletCode: Cell;
}

export function storeJettonWalletData(src: JettonWalletData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.balance, 257);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
        b_0.storeRef(src.walletCode);
    };
}

export function loadJettonWalletData(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadIntBig(257);
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    const _walletCode = sc_0.loadRef();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, walletCode: _walletCode };
}

export function loadTupleJettonWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    const _walletCode = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, walletCode: _walletCode };
}

export function loadGetterTupleJettonWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    const _walletCode = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, walletCode: _walletCode };
}

export function storeTupleJettonWalletData(source: JettonWalletData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    builder.writeCell(source.walletCode);
    return builder.build();
}

export function dictValueParserJettonWalletData(): DictionaryValue<JettonWalletData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWalletData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWalletData(src.loadRef().beginParse());
        }
    }
}

export type NeuroVault$Data = {
    $$type: 'NeuroVault$Data';
    owner: Address;
    operator: Address;
    totalSupply: bigint;
    totalAssets: bigint;
    performanceFeePrecise: bigint;
    minDepositAmount: bigint;
    autoCompoundCap: bigint;
    whitelistCount: bigint;
    whitelist1: Address;
    whitelist2: Address;
    whitelist3: Address;
    whitelist4: Address;
    whitelist5: Address;
    content: Cell;
    mintable: boolean;
}

export function storeNeuroVault$Data(src: NeuroVault$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.operator);
        b_0.storeCoins(src.totalSupply);
        b_0.storeCoins(src.totalAssets);
        b_0.storeUint(src.performanceFeePrecise, 16);
        b_0.storeCoins(src.minDepositAmount);
        b_0.storeUint(src.autoCompoundCap, 16);
        b_0.storeUint(src.whitelistCount, 8);
        const b_1 = new Builder();
        b_1.storeAddress(src.whitelist1);
        b_1.storeAddress(src.whitelist2);
        b_1.storeAddress(src.whitelist3);
        const b_2 = new Builder();
        b_2.storeAddress(src.whitelist4);
        b_2.storeAddress(src.whitelist5);
        b_2.storeRef(src.content);
        b_2.storeBit(src.mintable);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadNeuroVault$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _operator = sc_0.loadAddress();
    const _totalSupply = sc_0.loadCoins();
    const _totalAssets = sc_0.loadCoins();
    const _performanceFeePrecise = sc_0.loadUintBig(16);
    const _minDepositAmount = sc_0.loadCoins();
    const _autoCompoundCap = sc_0.loadUintBig(16);
    const _whitelistCount = sc_0.loadUintBig(8);
    const sc_1 = sc_0.loadRef().beginParse();
    const _whitelist1 = sc_1.loadAddress();
    const _whitelist2 = sc_1.loadAddress();
    const _whitelist3 = sc_1.loadAddress();
    const sc_2 = sc_1.loadRef().beginParse();
    const _whitelist4 = sc_2.loadAddress();
    const _whitelist5 = sc_2.loadAddress();
    const _content = sc_2.loadRef();
    const _mintable = sc_2.loadBit();
    return { $$type: 'NeuroVault$Data' as const, owner: _owner, operator: _operator, totalSupply: _totalSupply, totalAssets: _totalAssets, performanceFeePrecise: _performanceFeePrecise, minDepositAmount: _minDepositAmount, autoCompoundCap: _autoCompoundCap, whitelistCount: _whitelistCount, whitelist1: _whitelist1, whitelist2: _whitelist2, whitelist3: _whitelist3, whitelist4: _whitelist4, whitelist5: _whitelist5, content: _content, mintable: _mintable };
}

export function loadTupleNeuroVault$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _operator = source.readAddress();
    const _totalSupply = source.readBigNumber();
    const _totalAssets = source.readBigNumber();
    const _performanceFeePrecise = source.readBigNumber();
    const _minDepositAmount = source.readBigNumber();
    const _autoCompoundCap = source.readBigNumber();
    const _whitelistCount = source.readBigNumber();
    const _whitelist1 = source.readAddress();
    const _whitelist2 = source.readAddress();
    const _whitelist3 = source.readAddress();
    const _whitelist4 = source.readAddress();
    const _whitelist5 = source.readAddress();
    const _content = source.readCell();
    const _mintable = source.readBoolean();
    return { $$type: 'NeuroVault$Data' as const, owner: _owner, operator: _operator, totalSupply: _totalSupply, totalAssets: _totalAssets, performanceFeePrecise: _performanceFeePrecise, minDepositAmount: _minDepositAmount, autoCompoundCap: _autoCompoundCap, whitelistCount: _whitelistCount, whitelist1: _whitelist1, whitelist2: _whitelist2, whitelist3: _whitelist3, whitelist4: _whitelist4, whitelist5: _whitelist5, content: _content, mintable: _mintable };
}

export function loadGetterTupleNeuroVault$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _operator = source.readAddress();
    const _totalSupply = source.readBigNumber();
    const _totalAssets = source.readBigNumber();
    const _performanceFeePrecise = source.readBigNumber();
    const _minDepositAmount = source.readBigNumber();
    const _autoCompoundCap = source.readBigNumber();
    const _whitelistCount = source.readBigNumber();
    const _whitelist1 = source.readAddress();
    const _whitelist2 = source.readAddress();
    const _whitelist3 = source.readAddress();
    const _whitelist4 = source.readAddress();
    const _whitelist5 = source.readAddress();
    const _content = source.readCell();
    const _mintable = source.readBoolean();
    return { $$type: 'NeuroVault$Data' as const, owner: _owner, operator: _operator, totalSupply: _totalSupply, totalAssets: _totalAssets, performanceFeePrecise: _performanceFeePrecise, minDepositAmount: _minDepositAmount, autoCompoundCap: _autoCompoundCap, whitelistCount: _whitelistCount, whitelist1: _whitelist1, whitelist2: _whitelist2, whitelist3: _whitelist3, whitelist4: _whitelist4, whitelist5: _whitelist5, content: _content, mintable: _mintable };
}

export function storeTupleNeuroVault$Data(source: NeuroVault$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.operator);
    builder.writeNumber(source.totalSupply);
    builder.writeNumber(source.totalAssets);
    builder.writeNumber(source.performanceFeePrecise);
    builder.writeNumber(source.minDepositAmount);
    builder.writeNumber(source.autoCompoundCap);
    builder.writeNumber(source.whitelistCount);
    builder.writeAddress(source.whitelist1);
    builder.writeAddress(source.whitelist2);
    builder.writeAddress(source.whitelist3);
    builder.writeAddress(source.whitelist4);
    builder.writeAddress(source.whitelist5);
    builder.writeCell(source.content);
    builder.writeBoolean(source.mintable);
    return builder.build();
}

export function dictValueParserNeuroVault$Data(): DictionaryValue<NeuroVault$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNeuroVault$Data(src)).endCell());
        },
        parse: (src) => {
            return loadNeuroVault$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonData = {
    $$type: 'JettonData';
    totalSupply: bigint;
    mintable: boolean;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}

export function storeJettonData(src: JettonData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.totalSupply, 257);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
        b_0.storeRef(src.walletCode);
    };
}

export function loadJettonData(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadIntBig(257);
    const _mintable = sc_0.loadBit();
    const _owner = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    const _walletCode = sc_0.loadRef();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, walletCode: _walletCode };
}

export function loadTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    const _walletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, walletCode: _walletCode };
}

export function loadGetterTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    const _walletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, walletCode: _walletCode };
}

export function storeTupleJettonData(source: JettonData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.owner);
    builder.writeCell(source.content);
    builder.writeCell(source.walletCode);
    return builder.build();
}

export function dictValueParserJettonData(): DictionaryValue<JettonData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonData(src.loadRef().beginParse());
        }
    }
}

 type NeuroJettonWallet_init_args = {
    $$type: 'NeuroJettonWallet_init_args';
    master: Address;
    owner: Address;
}

function initNeuroJettonWallet_init_args(src: NeuroJettonWallet_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.master);
        b_0.storeAddress(src.owner);
    };
}

async function NeuroJettonWallet_init(master: Address, owner: Address) {
    const __code = Cell.fromHex('b5ee9c72410212010004ae00022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d90103014fa65ec0bb51343480006760404075c03e903e9015481b04e6be903e901640b4405c00b8b6cf1b0d200201145301db3c3054633052300904ba01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019d810101d700fa40fa4055206c139afa40fa405902d1017002e204e30202d70d1ff2e0822182100f8a7ea5bae302218210178d4519bae302018210595f07bcba0405080f00c2028020d7217021d749c21f9430d31f01de208210178d4519ba8e1d30d33ffa00596c21a002c87f01ca0055205023810101cf00cecec9ed54e082107bdd97deba8e1cd33ffa00596c21a002c87f01ca0055205023810101cf00cecec9ed54e05f0402e231d33ffa00fa40d72c01916d93fa4001e201f40431fa00f8416f2481114d533cc705f2f454732123fa40fa0071d721fa00fa00306c6170f83a44305244fa40fa0071d721fa00fa00306c6170f83aa08209c9c38001a023813ebb02a012bcf2f45164a18200f5fc21c2fff2f45284db3c5c090601fe705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d05076708040702c4813507cc855508210178d45195007cb1f15cb3f5003fa02ce01206e9430cf84809201cee201fa02cec910561057103440130710465522c8cf8580ca00cf8440ce01fa028069cf40025c6e070060016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205023810101cf00cecec9ed5403fe31d33ffa00fa40d72c01916d93fa4001e201fa00f8416f24532cc705b38ebb53c7db3c0181114d02705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d024c705f2f4de51a8a08200f5fc21c2fff2f440bc2bdb3c10344dcbfa40fa0071d721fa00fa00306c6170090a0b0018f82ac87001ca005a02cecec9002cf8276f1021a1820898968066b608a18208989680a0a102fcf83a23c2008e605183a15008a1167150657008c8553082107362d09c5005cb1f13cb3f01fa02cecec928441403506610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00599530365b6c21e2206eb39322c2009170e2923031e30d590c0e0186206ef2d0807088102310247250346d036d5520c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000d00180000000045786365737365730026c87f01ca0055205023810101cf00cecec9ed54010ee3025f04f2c0821001fcd33ffa00d72c01916d93fa4001e231f8416f2481114d5339c705f2f45175a18200f5fc21c2fff2f443305238fa40fa0071d721fa00fa00306c6170f83a8200a99e018209312d00a08208989680a012bcf2f47080405414367f04c8553082107bdd97de5005cb1f13cb3f01fa02ce01206e9430cf84809201cee2c926553011009610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205023810101cf00cecec9ed54a5504b9e');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initNeuroJettonWallet_init_args({ $$type: 'NeuroJettonWallet_init_args', master, owner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const NeuroJettonWallet_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    3256: { message: "Deposit too small to mint shares" },
    3734: { message: "Not Owner" },
    4429: { message: "Invalid sender" },
    4675: { message: "Insufficient vault assets" },
    7926: { message: "Fee shares too small to mint" },
    8987: { message: "Invalid sender: not owner or operator" },
    12392: { message: "Withdrawal amount too small" },
    12776: { message: "Whitelist index must be 1-5" },
    14294: { message: "Mint is disabled" },
    14534: { message: "Not owner" },
    16059: { message: "Invalid value" },
    16341: { message: "No profit to register" },
    16897: { message: "Deposit must respect the mathematical minimum (3 TON) to cover network fees." },
    17347: { message: "Profit exceeds single-cycle cap" },
    27021: { message: "Invalid supply state" },
    33824: { message: "Yield reception only from whitelisted protocols" },
    38247: { message: "ExecDelegate exceeds available assets" },
    43422: { message: "Invalid value - Burn" },
    44977: { message: "Cap too high! Max 10% per cycle" },
    51355: { message: "Target not in protocol whitelist" },
    53830: { message: "Insufficient TON sent for gas buffer." },
    55717: { message: "Cannot delegate zero amount" },
    58338: { message: "Fee too high! Max 30% allowed" },
    59952: { message: "Cannot burn zero tokens" },
    61374: { message: "Invalid burn notification sender" },
    62972: { message: "Invalid balance" },
} as const

export const NeuroJettonWallet_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Deposit too small to mint shares": 3256,
    "Not Owner": 3734,
    "Invalid sender": 4429,
    "Insufficient vault assets": 4675,
    "Fee shares too small to mint": 7926,
    "Invalid sender: not owner or operator": 8987,
    "Withdrawal amount too small": 12392,
    "Whitelist index must be 1-5": 12776,
    "Mint is disabled": 14294,
    "Not owner": 14534,
    "Invalid value": 16059,
    "No profit to register": 16341,
    "Deposit must respect the mathematical minimum (3 TON) to cover network fees.": 16897,
    "Profit exceeds single-cycle cap": 17347,
    "Invalid supply state": 27021,
    "Yield reception only from whitelisted protocols": 33824,
    "ExecDelegate exceeds available assets": 38247,
    "Invalid value - Burn": 43422,
    "Cap too high! Max 10% per cycle": 44977,
    "Target not in protocol whitelist": 51355,
    "Insufficient TON sent for gas buffer.": 53830,
    "Cannot delegate zero amount": 55717,
    "Fee too high! Max 30% allowed": 58338,
    "Cannot burn zero tokens": 59952,
    "Invalid burn notification sender": 61374,
    "Invalid balance": 62972,
} as const

const NeuroJettonWallet_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TokenTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":true}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TokenTransferInternal","header":395134233,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"from","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":true}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TokenNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"from","type":{"kind":"simple","type":"address","optional":false}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TokenBurn","header":1499400124,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":true}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"TokenBurnNotification","header":2078119902,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"ProvideWalletAddress","header":745978227,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"owner_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"include_address","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"TakeWalletAddress","header":3513996288,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"wallet_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"owner_address","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"Deposit","header":2393262120,"fields":[{"name":"intent","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"RequestWithdrawal","header":3936006414,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"AutoCompound","header":3924287516,"fields":[{"name":"profitToMint","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ExecDelegate","header":1258179490,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mode","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"UpdateFee","header":3144592497,"fields":[{"name":"performanceFeePrecise","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"UpdateOperator","header":1643308500,"fields":[{"name":"newOperator","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetWhitelist","header":993790908,"fields":[{"name":"index","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"target","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateAutoCompoundCap","header":927790173,"fields":[{"name":"newCap","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SwapAdditionalData","header":null,"fields":[{"name":"minOut","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"receiverAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"fwdGas","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"StonfiSwap","header":1717886506,"fields":[{"name":"otherTokenWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"refundAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"excessesAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"additionalData","type":{"kind":"simple","type":"SwapAdditionalData","optional":false}}]},
    {"name":"StonfiProvideLiquidity","header":3351079513,"fields":[{"name":"otherTokenWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"refundAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"excessesAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"minLpOut","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"NeuroJettonWallet$Data","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonWalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}},{"name":"walletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"NeuroVault$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"operator","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalAssets","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"performanceFeePrecise","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minDepositAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"autoCompoundCap","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"whitelistCount","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"whitelist1","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist2","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist3","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist4","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist5","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"JettonData","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"walletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
]

const NeuroJettonWallet_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "TokenTransfer": 260734629,
    "TokenTransferInternal": 395134233,
    "TokenNotification": 1935855772,
    "TokenBurn": 1499400124,
    "TokenBurnNotification": 2078119902,
    "ProvideWalletAddress": 745978227,
    "TakeWalletAddress": 3513996288,
    "Deposit": 2393262120,
    "RequestWithdrawal": 3936006414,
    "AutoCompound": 3924287516,
    "ExecDelegate": 1258179490,
    "UpdateFee": 3144592497,
    "UpdateOperator": 1643308500,
    "SetWhitelist": 993790908,
    "UpdateAutoCompoundCap": 927790173,
    "StonfiSwap": 1717886506,
    "StonfiProvideLiquidity": 3351079513,
}

const NeuroJettonWallet_getters: ABIGetter[] = [
    {"name":"get_wallet_data","methodId":97026,"arguments":[],"returnType":{"kind":"simple","type":"JettonWalletData","optional":false}},
]

export const NeuroJettonWallet_getterMapping: { [key: string]: string } = {
    'get_wallet_data': 'getGetWalletData',
}

const NeuroJettonWallet_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"TokenTransfer"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TokenTransferInternal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TokenBurn"}},
]


export class NeuroJettonWallet implements Contract {
    
    public static readonly minTonsForStorage = 10000000n;
    public static readonly gasConsumption = 10000000n;
    public static readonly storageReserve = 0n;
    public static readonly errors = NeuroJettonWallet_errors_backward;
    public static readonly opcodes = NeuroJettonWallet_opcodes;
    
    static async init(master: Address, owner: Address) {
        return await NeuroJettonWallet_init(master, owner);
    }
    
    static async fromInit(master: Address, owner: Address) {
        const __gen_init = await NeuroJettonWallet_init(master, owner);
        const address = contractAddress(0, __gen_init);
        return new NeuroJettonWallet(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new NeuroJettonWallet(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  NeuroJettonWallet_types,
        getters: NeuroJettonWallet_getters,
        receivers: NeuroJettonWallet_receivers,
        errors: NeuroJettonWallet_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: TokenTransfer | TokenTransferInternal | TokenBurn) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TokenTransfer') {
            body = beginCell().store(storeTokenTransfer(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TokenTransferInternal') {
            body = beginCell().store(storeTokenTransferInternal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TokenBurn') {
            body = beginCell().store(storeTokenBurn(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetWalletData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_wallet_data', builder.build())).stack;
        const result = loadGetterTupleJettonWalletData(source);
        return result;
    }
    
}