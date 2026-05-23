import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("auth redirects", () => {
  it("sends completed sign-ups to the standalone welcome setup route", () => {
    const signUpForm = read("app/(auth)/sign-up/[[...sign-up]]/_form.tsx");
    const ssoCallback = read("app/(auth)/sso-callback/page.tsx");

    expect(signUpForm).toContain('router.push("/welcome")');
    expect(signUpForm).toContain('redirectUrl: "/welcome"');
    expect(ssoCallback).toContain('signUpFallbackRedirectUrl="/welcome"');
  });
});
