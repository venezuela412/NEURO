/**
 * TON / TonConnect ecosystem packages sometimes assume Node globals.
 * Vite/browser bundles do not provide `Buffer` by default.
 */
import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}
