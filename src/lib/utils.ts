export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function fmt(n: number) {
  return `¥${(n || 0).toLocaleString()}`;
}

// Seeded PRNG for deterministic mock data (avoids hydration mismatch)
let seed = 42;
export function rnd(a: number, b: number) {
  seed = (seed * 16807 + 0) % 2147483647;
  return a + (seed % (b - a + 1));
}

export function resetSeed(s: number = 42) {
  seed = s;
}
