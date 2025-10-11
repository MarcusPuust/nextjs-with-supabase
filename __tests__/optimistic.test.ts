import { describe, it, expect } from "vitest";
import { optimisticUpdateTitle, optimisticRemove } from "@/lib/optimistic";

describe("optimistic helpers", () => {
  const base = [
    { id: 1, title: "A" },
    { id: 2, title: "B" },
  ];

  it("updates title for matching id", () => {
    const next = optimisticUpdateTitle(base, 2, "B2");
    expect(next.find((r) => r.id === 2)?.title).toBe("B2");
    expect(next.find((r) => r.id === 1)?.title).toBe("A");
  });

  it("removes row by id", () => {
    const next = optimisticRemove(base, 1);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe(2);
  });
});
