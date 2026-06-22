// Deterministic-ish ID generation. Module-level counter keeps ids stable within
// a server process and avoids Math.random for reproducibility in the prototype.

const counters: Record<string, number> = {};

export function nextId(prefix: string): string {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}_${counters[prefix].toString().padStart(4, "0")}`;
}

// Seed the counter past the highest pre-seeded id so generated ids never collide.
export function reserve(prefix: string, upTo: number): void {
  counters[prefix] = Math.max(counters[prefix] ?? 0, upTo);
}
