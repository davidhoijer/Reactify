import {generateCodeChallenge, generateCodeVerifier} from "./pkce";

const originalCrypto = globalThis.crypto;

beforeEach(() => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues: (array: Uint8Array) => {
        array.fill(1);
        return array;
      },
      subtle: {digest: jest.fn().mockResolvedValue(new Uint8Array([0xfb, 0xff, 0xef]).buffer)},
    },
  });
  Object.defineProperty(globalThis, "TextEncoder", {
    configurable: true,
    value: class {
      encode() {
        return new Uint8Array();
      }
    },
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, "crypto", {configurable: true, value: originalCrypto});
});

describe("PKCE helpers", () => {
  it("generates a verifier with the requested length", () => {
    const verifier = generateCodeVerifier(64);

    expect(verifier).toHaveLength(64);
    expect(verifier).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("encodes a SHA-256 digest as base64url", async () => {
    await expect(generateCodeChallenge("verifier")).resolves.toBe("-__v");
  });
});
