import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"

const N = 16384
const R = 8
const P = 1
const KEY_LENGTH = 64

function scryptAsync(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    )
  })
}

/** scrypt (memory-hard KDF from node:crypto). Format: scrypt$N$r$p$salt$hash */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, N, R, P)
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$")
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$")
  if (parts.length !== 6 || parts[0] !== "scrypt") return false
  const [, n, r, p, salt, hash] = parts
  const expected = Buffer.from(hash, "base64")
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

/** A precomputed hash used to keep login timing constant for unknown usernames. */
let dummyHash: Promise<string> | null = null
export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"))
  return dummyHash
}

export function generateToken(): string {
  return randomBytes(32).toString("base64url")
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}
