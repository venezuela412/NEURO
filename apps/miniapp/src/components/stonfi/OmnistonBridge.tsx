import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { OmnistonProvider } from "@ston-fi/omniston-sdk-react";
import { createOmnistonClient } from "../../lib/stonfi";

export function OmnistonBridge({ children }: PropsWithChildren) {
  const omniston = useMemo(() => createOmnistonClient(), []);

  return <OmnistonProvider omniston={omniston}>{children}</OmnistonProvider>;
}
