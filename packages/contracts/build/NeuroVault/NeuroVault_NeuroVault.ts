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

export type UpdateDelegateLimit = {
    $$type: 'UpdateDelegateLimit';
    newLimit: bigint;
}

export function storeUpdateDelegateLimit(src: UpdateDelegateLimit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3604641594, 32);
        b_0.storeUint(src.newLimit, 16);
    };
}

export function loadUpdateDelegateLimit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3604641594) { throw Error('Invalid prefix'); }
    const _newLimit = sc_0.loadUintBig(16);
    return { $$type: 'UpdateDelegateLimit' as const, newLimit: _newLimit };
}

export function loadTupleUpdateDelegateLimit(source: TupleReader) {
    const _newLimit = source.readBigNumber();
    return { $$type: 'UpdateDelegateLimit' as const, newLimit: _newLimit };
}

export function loadGetterTupleUpdateDelegateLimit(source: TupleReader) {
    const _newLimit = source.readBigNumber();
    return { $$type: 'UpdateDelegateLimit' as const, newLimit: _newLimit };
}

export function storeTupleUpdateDelegateLimit(source: UpdateDelegateLimit) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newLimit);
    return builder.build();
}

export function dictValueParserUpdateDelegateLimit(): DictionaryValue<UpdateDelegateLimit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateDelegateLimit(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateDelegateLimit(src.loadRef().beginParse());
        }
    }
}

export type UpdateDepositFee = {
    $$type: 'UpdateDepositFee';
    newFee: bigint;
}

export function storeUpdateDepositFee(src: UpdateDepositFee) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1162639545, 32);
        b_0.storeUint(src.newFee, 16);
    };
}

export function loadUpdateDepositFee(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1162639545) { throw Error('Invalid prefix'); }
    const _newFee = sc_0.loadUintBig(16);
    return { $$type: 'UpdateDepositFee' as const, newFee: _newFee };
}

export function loadTupleUpdateDepositFee(source: TupleReader) {
    const _newFee = source.readBigNumber();
    return { $$type: 'UpdateDepositFee' as const, newFee: _newFee };
}

export function loadGetterTupleUpdateDepositFee(source: TupleReader) {
    const _newFee = source.readBigNumber();
    return { $$type: 'UpdateDepositFee' as const, newFee: _newFee };
}

export function storeTupleUpdateDepositFee(source: UpdateDepositFee) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newFee);
    return builder.build();
}

export function dictValueParserUpdateDepositFee(): DictionaryValue<UpdateDepositFee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateDepositFee(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateDepositFee(src.loadRef().beginParse());
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
    maxDelegatePercent: bigint;
    depositFeePrecise: bigint;
    paused: boolean;
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
        b_0.storeUint(src.maxDelegatePercent, 16);
        b_0.storeUint(src.depositFeePrecise, 16);
        b_0.storeBit(src.paused);
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
    const _maxDelegatePercent = sc_0.loadUintBig(16);
    const _depositFeePrecise = sc_0.loadUintBig(16);
    const _paused = sc_0.loadBit();
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
    return { $$type: 'NeuroVault$Data' as const, owner: _owner, operator: _operator, totalSupply: _totalSupply, totalAssets: _totalAssets, performanceFeePrecise: _performanceFeePrecise, minDepositAmount: _minDepositAmount, autoCompoundCap: _autoCompoundCap, maxDelegatePercent: _maxDelegatePercent, depositFeePrecise: _depositFeePrecise, paused: _paused, whitelistCount: _whitelistCount, whitelist1: _whitelist1, whitelist2: _whitelist2, whitelist3: _whitelist3, whitelist4: _whitelist4, whitelist5: _whitelist5, content: _content, mintable: _mintable };
}

export function loadTupleNeuroVault$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _operator = source.readAddress();
    const _totalSupply = source.readBigNumber();
    const _totalAssets = source.readBigNumber();
    const _performanceFeePrecise = source.readBigNumber();
    const _minDepositAmount = source.readBigNumber();
    const _autoCompoundCap = source.readBigNumber();
    const _maxDelegatePercent = source.readBigNumber();
    const _depositFeePrecise = source.readBigNumber();
    const _paused = source.readBoolean();
    const _whitelistCount = source.readBigNumber();
    const _whitelist1 = source.readAddress();
    const _whitelist2 = source.readAddress();
    const _whitelist3 = source.readAddress();
    source = source.readTuple();
    const _whitelist4 = source.readAddress();
    const _whitelist5 = source.readAddress();
    const _content = source.readCell();
    const _mintable = source.readBoolean();
    return { $$type: 'NeuroVault$Data' as const, owner: _owner, operator: _operator, totalSupply: _totalSupply, totalAssets: _totalAssets, performanceFeePrecise: _performanceFeePrecise, minDepositAmount: _minDepositAmount, autoCompoundCap: _autoCompoundCap, maxDelegatePercent: _maxDelegatePercent, depositFeePrecise: _depositFeePrecise, paused: _paused, whitelistCount: _whitelistCount, whitelist1: _whitelist1, whitelist2: _whitelist2, whitelist3: _whitelist3, whitelist4: _whitelist4, whitelist5: _whitelist5, content: _content, mintable: _mintable };
}

export function loadGetterTupleNeuroVault$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _operator = source.readAddress();
    const _totalSupply = source.readBigNumber();
    const _totalAssets = source.readBigNumber();
    const _performanceFeePrecise = source.readBigNumber();
    const _minDepositAmount = source.readBigNumber();
    const _autoCompoundCap = source.readBigNumber();
    const _maxDelegatePercent = source.readBigNumber();
    const _depositFeePrecise = source.readBigNumber();
    const _paused = source.readBoolean();
    const _whitelistCount = source.readBigNumber();
    const _whitelist1 = source.readAddress();
    const _whitelist2 = source.readAddress();
    const _whitelist3 = source.readAddress();
    const _whitelist4 = source.readAddress();
    const _whitelist5 = source.readAddress();
    const _content = source.readCell();
    const _mintable = source.readBoolean();
    return { $$type: 'NeuroVault$Data' as const, owner: _owner, operator: _operator, totalSupply: _totalSupply, totalAssets: _totalAssets, performanceFeePrecise: _performanceFeePrecise, minDepositAmount: _minDepositAmount, autoCompoundCap: _autoCompoundCap, maxDelegatePercent: _maxDelegatePercent, depositFeePrecise: _depositFeePrecise, paused: _paused, whitelistCount: _whitelistCount, whitelist1: _whitelist1, whitelist2: _whitelist2, whitelist3: _whitelist3, whitelist4: _whitelist4, whitelist5: _whitelist5, content: _content, mintable: _mintable };
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
    builder.writeNumber(source.maxDelegatePercent);
    builder.writeNumber(source.depositFeePrecise);
    builder.writeBoolean(source.paused);
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

 type NeuroVault_init_args = {
    $$type: 'NeuroVault_init_args';
    owner: Address;
    content: Cell;
}

function initNeuroVault_init_args(src: NeuroVault_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
    };
}

async function NeuroVault_init(owner: Address, content: Cell) {
    const __code = Cell.fromHex('b5ee9c7241025f01001999000262ff008e88f4a413f4bcf2c80bed53208e9c30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862e1ed43d901220202710216020120030b0201200409020166050702e0ab1ded44d0d200018e54fa40fa40fa00fa00d30ffa00d30fd30fd30fd200d307d401d0fa40fa40fa40d430d0fa40fa40d4d20030071112070711110707111007107f107e107d107c107b107a1079107857121110111111100f11100f550e8e87fa40d45902d101e2db3c57105f0f6c21230600022e02e0a8b5ed44d0d200018e54fa40fa40fa00fa00d30ffa00d30fd30fd30fd200d307d401d0fa40fa40fa40d430d0fa40fa40d4d20030071112070711110707111007107f107e107d107c107b107a1079107857121110111111100f11100f550e8e87fa40d45902d101e2db3c57105f0f6c21230800022a02e1b6b7bda89a1a400031ca9f481f481f401f401a61ff401a61fa61fa61fa401a60fa803a1f481f481f481a861a1f481f481a9a400600e22240e0e22220e0e22200e20fe20fc20fa20f820f620f420f220f0ae242220222222201e22201eaa1d1d0ff481a8b205a203c5b678ae20be1ed8430230a0002290201200c110201200d0f02e1b1477b513434800063953e903e903e803e8034c3fe8034c3f4c3f4c3f48034c1f500743e903e903e90350c343e903e903534800c01c44481c1c44441c1c44401c41fc41f841f441f041ec41e841e441e15c484440444444403c44403d543a3a1fe90351640b44078b6cf15c417c3db0860230e0004561102e1b032fb513434800063953e903e903e803e8034c3fe8034c3f4c3f4c3f48034c1f500743e903e903e90350c343e903e903534800c01c44481c1c44441c1c44401c41fc41f841f441f041ec41e841e441e15c484440444444403c44403d543a3a1fe90351640b44078b6cf15c417c3db0860231000422f9682103b9aca00e12e82080f4240a082103b9aca00a8561082080f4240a0a904020378a0121402dfa36fb513434800063953e903e903e803e8034c3fe8034c3f4c3f4c3f48034c1f500743e903e903e90350c343e903e903534800c01c44481c1c44441c1c44401c41fc41f841f441f041ec41e841e441e15c484440444444403c44403d543a3a1fe90351640b44078b6cf15c417c3db086231300022b02dfa3fbb513434800063953e903e903e803e8034c3fe8034c3f4c3f4c3f48034c1f500743e903e903e90350c343e903e903534800c01c44481c1c44441c1c44401c41fc41f841f441f041ec41e841e441e15c484440444444403c44403d543a3a1fe90351640b44078b6cf15c417c3db0862315000227020120171d020166181b03f9adbcf6a268690000c72a7d207d207d007d006987fd006987e987e987e9006983ea00e87d207d207d206a18687d207d206a690018038889038388888383888803883f883f083e883e083d883d083c883c2b8908880888888807888807aa874743fd206a2c816880f108888889088888880888888807888807aa876d9e4023191a0164f82801db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d036000c57105f0f6c2102ddaf16f6a268690000c72a7d207d207d007d006987fd006987e987e987e9006983ea00e87d207d207d206a18687d207d206a690018038889038388888383888803883f883f083e883e083d883d083c883c2b8908880888888807888807aa874743fd206a2c816880f16d9e367ab61ac0231c011ef8285612db3c305610522256145252360201581e2002e1b337bb513434800063953e903e903e803e8034c3fe8034c3f4c3f4c3f48034c1f500743e903e903e90350c343e903e903534800c01c44481c1c44441c1c44401c41fc41f841f441f041ec41e841e441e15c484440444444403c44403d543a3a1fe90351640b44078b6cf15c417c3db0860231f00022802e1b2da3b513434800063953e903e903e803e8034c3fe8034c3f4c3f4c3f48034c1f500743e903e903e90350c343e903e903534800c01c44481c1c44441c1c44401c41fc41f841f441f041ec41e841e441e15c484440444444403c44403d543a3a1fe90351640b44078b6cf15c417c3db086023210004561003feed44d0d200018e54fa40fa40fa00fa00d30ffa00d30fd30fd30fd200d307d401d0fa40fa40fa40d430d0fa40fa40d4d20030071112070711110707111007107f107e107d107c107b107a1079107857121110111111100f11100f550e8e87fa40d45902d101e21113945f0f5f04e0705612d74920c21fe30001c00001c121b023255403f62170208107d08210b2d05e008101f48113887a707f278d08600000000000000000000000000000000000000000000000000000000000000000048d08600000000000000000000000000000000000000000000000000000000000000000048989890f11110f0f11100f10ef10de10cd10bc10ab109a1089107855152424240043800000000000000000000000000000000000000000000000000000000000000000100456311112d31f2182108ea64828bae3022182107bdd97debae302218210e9e7e01cbae3022182104afe4ba2ba26282b2f03fc5b57110f11110f0e11100e10df551cdb3cf8416f24303281131e532fbef2f41110111311100f11120f0e11110e0d11130d0c11120c0b11110b0a11130a09111209081111080711130706111206051111050411130403111203021111020111130111128153191112db3c561501bc01111301f2f41110111111100f11100f305927039c550edb3c01111401a15309a8812710a9045210a1561082080f4240a0561082080f4240a059a801a904810cb821c200f2f450ffa051fea011111113111111101112111011110f11100f551d21db3c592d5302fe3157121111d33f31fa00fa40d72c01916d93fa4001e231f8416f2410235f03f82823db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d00181090202c705f2f481628723c200f2f482008f11561124bef2f4561082080f4240a0561082080f4240a05240a8362902fc01a9048200f00121c200f2f4205611bc92302fde811243561122bef2f40111110103a151f2a156106eb397310f206ef2d080925710e2707f88103410246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000f11110f0e11100e5e2c551b2a530026000000006e544f4e205769746864726177616c03fc3157121111fa00301110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411124130db3cdb3c8200a4305613c200f2f453eba8812710a9045613816b8d02bbf2f411122da8812710a9042f82080f4240a02f82080f4240a059a801a90481528a21c200f2f451ffa05611111311111112111130312c01dc011111010f11100f10ef10de10cd10bc10ab109a108910781067105610451034401321db3cc87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54db312d02f68200ddb824f2f4f8285003db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0820afaf080707021f828218b081035104a1023102bc855508210178d45195007cb1f15cb3f5003fa02ce01206e9430cf84809201cee201fa02cec94016504405362e006a0310465522c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0004fe8ffd3157121111fa40fa00d307f404301111111311115e3f0e11120e0d11130d0c11120c0b11130b0a11120a0911130908111208071113070611120605111305041112040311130302111202011114011115db3cdb3c1110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a09111109111108070655403031323400108200863e29b3f2f4003af8416f2410235f038200c7a0215614c70592317f95015612c705e2f2f402fc8118a211125614db3c01111301f2f4811f6d5613c200f2f48151ef2e5614bef2f453d9a8812710a90456138200ab0b02bbf2f40d5612a10311130302111202011114017f01111610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00563300d00c11110c0b11100b10af10ce108d107c106b105a1049103847155044461603c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54db3104fae02182103b3c0bbcba8edc3157121111d307fa4030810e96f8425613c705f2f4815a2122c2009322c1069170e2f2f421c001923625de21c002923524de21c003923423de21c004923322de21c00591329130e25306bc91369130e20f11110f0e11100e10df551ce02182102c76b973bae302218210bb6eac71bae3022153354b4c03fe3157121111d33ffa40d20030f8416f2410235f03f82823db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d06d039232129133e2705043804003c855208210d17354005004cb1f12cb3fce01206e9430cf84809201cee2c95a6d6d40037fc8cf8580ca008936494a011688c87001ca005a02cecec937022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9383a014fa65ec0bb51343480006760404075c03e903e9015481b04e6be903e901640b4405c00b8b6cf1b0d203901145301db3c3054633052304004ba01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019d810101d700fa40fa4055206c139afa40fa405902d1017002e204e30202d70d1ff2e0822182100f8a7ea5bae302218210178d4519bae302018210595f07bcba3b3c3f4600c2028020d7217021d749c21f9430d31f01de208210178d4519ba8e1d30d33ffa00596c21a002c87f01ca0055205023810101cf00cecec9ed54e082107bdd97deba8e1cd33ffa00596c21a002c87f01ca0055205023810101cf00cecec9ed54e05f0402e231d33ffa00fa40d72c01916d93fa4001e201f40431fa00f8416f2481114d533cc705f2f454732123fa40fa0071d721fa00fa00306c6170f83a44305244fa40fa0071d721fa00fa00306c6170f83aa08209c9c38001a023813ebb02a012bcf2f45164a18200f5fc21c2fff2f45284db3c5c403d01fe705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d05076708040702c4813507cc855508210178d45195007cb1f15cb3f5003fa02ce01206e9430cf84809201cee201fa02cec910561057103440130710465522c8cf8580ca00cf8440ce01fa028069cf40025c6e3e0060016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205023810101cf00cecec9ed5403fe31d33ffa00fa40d72c01916d93fa4001e201fa00f8416f24532cc705b38ebb53c7db3c0181114d02705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d024c705f2f4de51a8a08200f5fc21c2fff2f440bc2bdb3c10344dcbfa40fa0071d721fa00fa00306c61704041420018f82ac87001ca005a02cecec9002cf8276f1021a1820898968066b608a18208989680a0a102fcf83a23c2008e605183a15008a1167150657008c8553082107362d09c5005cb1f13cb3f01fa02cecec928441403506610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00599530365b6c21e2206eb39322c2009170e2923031e30d5943450186206ef2d0807088102310247250346d036d5520c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb004400180000000045786365737365730026c87f01ca0055205023810101cf00cecec9ed54010ee3025f04f2c0824701fcd33ffa00d72c01916d93fa4001e231f8416f2481114d5339c705f2f45175a18200f5fc21c2fff2f443305238fa40fa0071d721fa00fa00306c6170f83a8200a99e018209312d00a08208989680a012bcf2f47080405414367f04c8553082107bdd97de5005cb1f13cb3f01fa02ce01206e9430cf84809201cee2c926553048009610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205023810101cf00cecec9ed5400011000fccf16ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000f11110f0e11100e10df551cc87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54db31017c313d57110bd30f30810e96f8425611c705f2f48200f4e621810bb8bbf2f40f11110f0e11100e10df10ce0d10ac109b108a107910681057104610354430125304c8821061f2e5d4bae302218210374cf45dba8ebe313b571109d30f30810e96f8425611c705f2f48200f923218103e8bbf2f40f11110f0e11100e10df10ce10bd10ac0b108a10791068105710461035443012e0218210d6da773abae302218210454c78b9ba4d534e4f00f631571057110efa4030810e96f8425611c705f2f40f11110f111010df10ce10bd10ac109b108a107910681057104610354403c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54db310178313a571108d30f30810e96f8425611c705f2f4811e1021811f40bbf2f40f11110f0e11100e10df10ce10bd10ac109b0a1079106810571046103544035303aa8ebc3139571107d30f30810e96f8425611c705f2f48200899321c165f2f40f11110f0e11100e10df10ce10bd10ac109b108a091068105710461035443012e0218210946a98b6bae302218210819dbe99bae302111353505101c03157121111d33f30c8018210aff90f5758cb1fcb3fc91110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb005302e03157121111d33ffa4030011112011113db3c57115612011112011113c8598210327b2b4a5003cb1fcb3fcec90f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb0052530012f8425612c705f2e0840092c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54db3104ece3021111f9012082f0c4ef345fe0b9e216a8c1826ac7fa38d0ec1c6893aafa3cf2e9161246bfd4661abae3022082f01426f4b2781b50266062a76b40df9ae9835c2d109b7be92e1048e36bc2761d67bae3022082f0818377509e6b15156bb56cd33fb939f5f4499040536211513c5d5ce55de4a25aba55585b5c02fc5711f8416f2430321110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a091111090811110807111107061111060511110504111104031111030211110201111101111281713511145613db3c9357137f9611135610c705e201111401f2f411101ca00e11110e0d11100d10cf0e10ad109c108b107a565700a8205613c70592307fe028c200945307c7059170e292307fe028c201945306c7059170e292307fe028c202945305c7059170e292307fe028c203945304c7059170e292307fe028c2049323c705923070e2917fe07000a6106910581047103645404300c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed5402bc30810e96f8425611c705f2f4f8276f101110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411124130db3c8208989680a0561321bc9a3f011112010ea10d111193305712e21110111111100f11100f550e595a000a820afaf080008ec87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed5400e43036810e96f8425610c705f2f40e11100e10df10ce10bd10ac109b108a107910687f081057104610354403c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed5401f28e723036810e96f8425610c705f2f40e11100e10df10ce10bd10ac109b108a1079106870081057104610354403c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54e0571211115d015682f064d5198fe48e1c880304d52b76150cdde129b8cb2bcb68ddccc9782e271972d9bae3025f0f5bf2c0825e00b6810e96f8425610c705f2f40e11100e10df551c70c87f01ca0011121111111055e0011111011112ce1fce500dfa02500bfa0219cb0f5007fa0215cb0f13cb0fcb0fca00cb0701c8ce12ce12ce02c8ce13ce13cc13ca00cdcdc9ed54c9258d3f');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initNeuroVault_init_args({ $$type: 'NeuroVault_init_args', owner, content })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const NeuroVault_errors = {
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
    2306: { message: "Invalid burn sender" },
    3256: { message: "Deposit too small to mint shares" },
    3734: { message: "Not Owner" },
    4429: { message: "Invalid sender" },
    4675: { message: "Insufficient vault assets" },
    4894: { message: "Below minimum deposit (3 TON)" },
    6306: { message: "Target not whitelisted" },
    7696: { message: "Max 80%" },
    8045: { message: "Zero delegation" },
    16059: { message: "Invalid value" },
    20975: { message: "Exceeds available assets" },
    21130: { message: "Fee too small to mint" },
    21273: { message: "Insufficient TON for gas" },
    23073: { message: "Index 1-5" },
    25223: { message: "Cannot burn zero" },
    27533: { message: "Profit exceeds cycle cap" },
    28981: { message: "Yield only from whitelisted sources" },
    34366: { message: "Vault is paused" },
    35219: { message: "Max 1%" },
    36625: { message: "Burn exceeds supply" },
    42032: { message: "No profit" },
    43422: { message: "Invalid value - Burn" },
    43787: { message: "Exceeds per-tx delegation cap" },
    51104: { message: "Not owner or operator" },
    56760: { message: "Minting disabled" },
    61441: { message: "Withdrawal too small" },
    62694: { message: "Max 30%" },
    62972: { message: "Invalid balance" },
    63779: { message: "Max 10%" },
} as const

export const NeuroVault_errors_backward = {
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
    "Invalid burn sender": 2306,
    "Deposit too small to mint shares": 3256,
    "Not Owner": 3734,
    "Invalid sender": 4429,
    "Insufficient vault assets": 4675,
    "Below minimum deposit (3 TON)": 4894,
    "Target not whitelisted": 6306,
    "Max 80%": 7696,
    "Zero delegation": 8045,
    "Invalid value": 16059,
    "Exceeds available assets": 20975,
    "Fee too small to mint": 21130,
    "Insufficient TON for gas": 21273,
    "Index 1-5": 23073,
    "Cannot burn zero": 25223,
    "Profit exceeds cycle cap": 27533,
    "Yield only from whitelisted sources": 28981,
    "Vault is paused": 34366,
    "Max 1%": 35219,
    "Burn exceeds supply": 36625,
    "No profit": 42032,
    "Invalid value - Burn": 43422,
    "Exceeds per-tx delegation cap": 43787,
    "Not owner or operator": 51104,
    "Minting disabled": 56760,
    "Withdrawal too small": 61441,
    "Max 30%": 62694,
    "Invalid balance": 62972,
    "Max 10%": 63779,
} as const

const NeuroVault_types: ABIType[] = [
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
    {"name":"UpdateDelegateLimit","header":3604641594,"fields":[{"name":"newLimit","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"UpdateDepositFee","header":1162639545,"fields":[{"name":"newFee","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SwapAdditionalData","header":null,"fields":[{"name":"minOut","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"receiverAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"fwdGas","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"StonfiSwap","header":1717886506,"fields":[{"name":"otherTokenWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"refundAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"excessesAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"additionalData","type":{"kind":"simple","type":"SwapAdditionalData","optional":false}}]},
    {"name":"StonfiProvideLiquidity","header":3351079513,"fields":[{"name":"otherTokenWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"refundAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"excessesAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"minLpOut","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"NeuroJettonWallet$Data","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonWalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}},{"name":"walletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"NeuroVault$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"operator","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalAssets","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"performanceFeePrecise","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minDepositAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"autoCompoundCap","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"maxDelegatePercent","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"depositFeePrecise","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"whitelistCount","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"whitelist1","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist2","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist3","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist4","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelist5","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"JettonData","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"walletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
]

const NeuroVault_opcodes = {
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
    "UpdateDelegateLimit": 3604641594,
    "UpdateDepositFee": 1162639545,
    "StonfiSwap": 1717886506,
    "StonfiProvideLiquidity": 3351079513,
}

const NeuroVault_getters: ABIGetter[] = [
    {"name":"get_jetton_data","methodId":106029,"arguments":[],"returnType":{"kind":"simple","type":"JettonData","optional":false}},
    {"name":"get_wallet_address","methodId":103289,"arguments":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"tvl","methodId":68381,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"operator","methodId":129896,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"autoCompoundCap","methodId":91355,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"whitelistCount","methodId":91646,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isPaused","methodId":126174,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"depositFee","methodId":79293,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"maxDelegatePercent","methodId":68789,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"sharePrice","methodId":86219,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const NeuroVault_getterMapping: { [key: string]: string } = {
    'get_jetton_data': 'getGetJettonData',
    'get_wallet_address': 'getGetWalletAddress',
    'tvl': 'getTvl',
    'operator': 'getOperator',
    'autoCompoundCap': 'getAutoCompoundCap',
    'whitelistCount': 'getWhitelistCount',
    'isPaused': 'getIsPaused',
    'depositFee': 'getDepositFee',
    'maxDelegatePercent': 'getMaxDelegatePercent',
    'sharePrice': 'getSharePrice',
    'owner': 'getOwner',
}

const NeuroVault_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deposit"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TokenBurnNotification"}},
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AutoCompound"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ExecDelegate"}},
    {"receiver":"internal","message":{"kind":"text","text":"Sync"}},
    {"receiver":"internal","message":{"kind":"text","text":"Pause"}},
    {"receiver":"internal","message":{"kind":"text","text":"Unpause"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetWhitelist"}},
    {"receiver":"internal","message":{"kind":"text","text":"StopMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ProvideWalletAddress"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateFee"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateOperator"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateAutoCompoundCap"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateDelegateLimit"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateDepositFee"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export const VIRTUAL_SUPPLY = 1000000n;
export const VIRTUAL_ASSETS = 1000000n;

export class NeuroVault implements Contract {
    
    public static readonly minTonsForStorage = 10000000n;
    public static readonly gasConsumption = 10000000n;
    public static readonly storageReserve = 0n;
    public static readonly errors = NeuroVault_errors_backward;
    public static readonly opcodes = NeuroVault_opcodes;
    
    static async init(owner: Address, content: Cell) {
        return await NeuroVault_init(owner, content);
    }
    
    static async fromInit(owner: Address, content: Cell) {
        const __gen_init = await NeuroVault_init(owner, content);
        const address = contractAddress(0, __gen_init);
        return new NeuroVault(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new NeuroVault(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  NeuroVault_types,
        getters: NeuroVault_getters,
        receivers: NeuroVault_receivers,
        errors: NeuroVault_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deposit | TokenBurnNotification | null | AutoCompound | ExecDelegate | "Sync" | "Pause" | "Unpause" | SetWhitelist | "StopMint" | ProvideWalletAddress | UpdateFee | UpdateOperator | UpdateAutoCompoundCap | UpdateDelegateLimit | UpdateDepositFee | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deposit') {
            body = beginCell().store(storeDeposit(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TokenBurnNotification') {
            body = beginCell().store(storeTokenBurnNotification(message)).endCell();
        }
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AutoCompound') {
            body = beginCell().store(storeAutoCompound(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ExecDelegate') {
            body = beginCell().store(storeExecDelegate(message)).endCell();
        }
        if (message === "Sync") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === "Pause") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === "Unpause") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetWhitelist') {
            body = beginCell().store(storeSetWhitelist(message)).endCell();
        }
        if (message === "StopMint") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ProvideWalletAddress') {
            body = beginCell().store(storeProvideWalletAddress(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateFee') {
            body = beginCell().store(storeUpdateFee(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateOperator') {
            body = beginCell().store(storeUpdateOperator(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateAutoCompoundCap') {
            body = beginCell().store(storeUpdateAutoCompoundCap(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateDelegateLimit') {
            body = beginCell().store(storeUpdateDelegateLimit(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateDepositFee') {
            body = beginCell().store(storeUpdateDepositFee(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetJettonData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_jetton_data', builder.build())).stack;
        const result = loadGetterTupleJettonData(source);
        return result;
    }
    
    async getGetWalletAddress(provider: ContractProvider, owner: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(owner);
        const source = (await provider.get('get_wallet_address', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getTvl(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('tvl', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getOperator(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('operator', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getAutoCompoundCap(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('autoCompoundCap', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getWhitelistCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('whitelistCount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsPaused(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isPaused', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getDepositFee(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('depositFee', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getMaxDelegatePercent(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('maxDelegatePercent', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getSharePrice(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('sharePrice', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}