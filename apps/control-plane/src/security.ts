import { Address, Cell, contractAddress, loadStateInit } from "@ton/core";
import { sha256 } from "@ton/crypto";
import type { SignedActionProof } from "@neuro/shared";
import nacl from "tweetnacl";

const VALID_WINDOW_SECONDS = 15 * 60;

function getAllowedDomains() {
  return (process.env.ALLOWED_SIGN_DOMAINS ?? "localhost:5173,127.0.0.1:5173,neuro-ton.app")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function tryParsePublicKeyFromStateInit(stateInitBase64?: string): Buffer | null {
  if (!stateInitBase64) {
    return null;
  }

  try {
    const stateInit = loadStateInit(Cell.fromBase64(stateInitBase64).beginParse());
    const dataCell = stateInit.data;
    if (!dataCell) {
      return null;
    }

    const slice = dataCell.beginParse();
    if (slice.remainingBits < 320) {
      return null;
    }

    slice.skip(64);
    const publicKey = slice.loadBuffer(32);
    return publicKey;
  } catch {
    return null;
  }
}

async function createTextHash(
  proof: SignedActionProof,
  parsedAddress: Address,
): Promise<Buffer> {
  const workchain = Buffer.alloc(4);
  workchain.writeInt32BE(parsedAddress.workChain);

  const domainBuffer = Buffer.from(proof.domain, "utf8");
  const domainLength = Buffer.alloc(4);
  domainLength.writeUInt32BE(domainBuffer.length);

  const timestampBuffer = Buffer.alloc(8);
  timestampBuffer.writeBigUInt64BE(BigInt(proof.timestamp));

  const payloadBuffer = Buffer.from(proof.payload.text, "utf8");
  const payloadLength = Buffer.alloc(4);
  payloadLength.writeUInt32BE(payloadBuffer.length);

  const message = Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from("ton-connect/sign-data/"),
    workchain,
    parsedAddress.hash,
    domainLength,
    domainBuffer,
    timestampBuffer,
    Buffer.from("txt"),
    payloadLength,
    payloadBuffer,
  ]);

  return Buffer.from(await sha256(message));
}

export async function verifySignedAction(
  proof: SignedActionProof,
  expectedWalletAddress: string,
): Promise<boolean> {
  try {
    if (proof.walletAddress !== expectedWalletAddress) {
      return false;
    }

    if (proof.payload.type !== "text") {
      return false;
    }

    if (!getAllowedDomains().includes(proof.domain)) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - proof.timestamp) > VALID_WINDOW_SECONDS) {
      return false;
    }

    const parsedAddress = Address.parse(proof.walletAddress);
    let publicKey: Uint8Array | null = proof.publicKey
      ? new Uint8Array(Buffer.from(proof.publicKey, "hex"))
      : null;

    if (!publicKey) {
      const parsedKey = tryParsePublicKeyFromStateInit(proof.walletStateInit);
      publicKey = parsedKey ? new Uint8Array(parsedKey) : null;
    }

    if (!publicKey) {
      return false;
    }

    if (proof.walletStateInit) {
      const stateInit = loadStateInit(Cell.fromBase64(proof.walletStateInit).beginParse());
      const calculated = contractAddress(parsedAddress.workChain, stateInit);
      if (!calculated.equals(parsedAddress)) {
        return false;
      }
    }

    const hash = await createTextHash(proof, parsedAddress);

    return nacl.sign.detached.verify(
      new Uint8Array(hash),
      new Uint8Array(Buffer.from(proof.signature, "base64")),
      publicKey,
    );
  } catch {
    return false;
  }
}
