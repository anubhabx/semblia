import { tokensToCssVars as formsCoreTokensToCssVars } from "@workspace/forms-core";
import type * as React from "react";
import type { DesignTokens } from "./studio-types";

export { hexAlpha, textureBg } from "@workspace/forms-core";

export function tokensToCssVars(t: DesignTokens): React.CSSProperties {
  return {
    ...formsCoreTokensToCssVars(t),
    ...(t.dark ? { colorScheme: "dark" as const } : {}),
  } as React.CSSProperties;
}
