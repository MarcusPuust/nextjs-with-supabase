// __tests__/serverProjects.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---
const insertSpy = vi.fn();
const updateSpy = vi.fn();
const deleteSpy = vi.fn();
const selectSpy = vi.fn();

vi.mock("next/cache", () => {
  return { revalidatePath: vi.fn() };
});

vi.mock("@/lib/supabase/server", () => {
  return {
    createClient: async () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "u1" } },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation((_table: string) => ({
        insert: insertSpy.mockResolvedValue({ error: null }),
        update: (payload: unknown) => ({
          eq: (_field: string, _id: string) =>
            updateSpy(payload) || Promise.resolve({ error: null }),
        }),
        delete: () => ({
          eq: (_field: string, _id: string) =>
            deleteSpy() || Promise.resolve({ error: null }),
        }),
        select: selectSpy,
        order: vi.fn(),
      })),
    }),
  };
});

// import after mocks
import * as PageMod from "@/app/projects/page";
import { revalidatePath } from "next/cache";

function mf(data: Record<string, unknown>) {
  // teeb FormData sarnase API sinu actionitele
  return {
    get: (k: string) => (data as any)[k],
  } as unknown as FormData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("server actions: projects", () => {
  it("createProject inserts row and revalidates", async () => {
    await PageMod.__test__.createProject(mf({ name: "New Project" }));
    expect(insertSpy).toHaveBeenCalledWith({
      name: "New Project",
      user_id: "u1",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/projects");
  });

  it("updateProject updates by id and revalidates", async () => {
    await PageMod.__test__.updateProject(mf({ id: "10", name: "Renamed" }));
    expect(updateSpy).toHaveBeenCalledWith({ name: "Renamed" });
    expect(revalidatePath).toHaveBeenCalledWith("/projects");
  });

  it("deleteProject removes by id and revalidates", async () => {
    await PageMod.__test__.deleteProject(mf({ id: "10" }));
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/projects");
  });

  it("createProject throws if empty name", async () => {
    await expect(
      PageMod.__test__.createProject(mf({ name: "   " }))
    ).rejects.toThrow(/name required/i);
  });

  it("updateProject throws on missing fields", async () => {
    await expect(
      PageMod.__test__.updateProject(mf({ id: "", name: "" }))
    ).rejects.toThrow(/missing fields/i);
  });

  it("deleteProject throws on missing id", async () => {
    await expect(PageMod.__test__.deleteProject(mf({}))).rejects.toThrow(
      /missing id/i
    );
  });
});
