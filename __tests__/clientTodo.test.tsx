import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientTodo from "@/app/todo/clientTodo";

type Row = { id: number; title: string; deleted: boolean; created_at: string };
const now = new Date().toISOString();
let DATA: Row[] = [
  { id: 1, title: "Learn Vitest", deleted: false, created_at: now },
];

function makeSupabaseMock() {
  return {
    from: vi.fn().mockImplementation((_table: string) => ({
      // list: select().eq(...).order(...)
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: DATA, error: null }),
      single: vi.fn().mockReturnThis(),

      // create: .insert(...).select().single()
      insert: vi.fn().mockImplementation(({ title }: { title: string }) => {
        const row = {
          id: Math.max(0, ...DATA.map((d) => d.id)) + 1,
          title,
          deleted: false,
          created_at: now,
        };
        DATA = [row, ...DATA];
        return {
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: row, error: null }),
        };
      }),

      // update: .update(payload).eq('id', id).select().single()
      update: vi.fn().mockImplementation((payload: Partial<Row>) => ({
        eq: vi.fn().mockImplementation((_field: string, id: number) => {
          DATA = DATA.map((d) => (d.id === id ? { ...d, ...payload } : d));
          const updated = DATA.find((d) => d.id === id) || null;
          return {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: updated, error: null }),
          };
        }),
      })),

      // delete: .delete().eq('id', id)
      delete: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockImplementation((_field: string, id: number) => {
          const removed = DATA.find((d) => d.id === id) || null;
          DATA = DATA.filter((d) => d.id !== id);
          return Promise.resolve({ data: removed, error: null });
        }),
      })),
    })),
  };
}

vi.mock("@/lib/supabase/client", () => {
  return { createClient: () => makeSupabaseMock() };
});

beforeEach(() => {
  DATA = [{ id: 1, title: "Learn Vitest", deleted: false, created_at: now }];
});

describe("ClientTodo", () => {
  it("renders initial list", async () => {
    render(<ClientTodo />);
    expect(await screen.findByText("Learn Vitest")).toBeInTheDocument();
  });

  it("creates a new todo", async () => {
    render(<ClientTodo />);
    const input = await screen.findByPlaceholderText("Add a task…");
    await userEvent.type(input, "Write tests");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(await screen.findByText("Write tests")).toBeInTheDocument();
  });

  it("edits existing todo", async () => {
    render(<ClientTodo />);
    const row = await screen.findByText("Learn Vitest");
    const tr = row.closest("tr")!;
    const editBtn = within(tr).getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);
    const editInput = within(tr).getByRole("textbox");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Learn Vitest deeply");
    await userEvent.click(within(tr).getByRole("button", { name: /save/i }));
    expect(await screen.findByText("Learn Vitest deeply")).toBeInTheDocument();
  });

  it("deletes a todo", async () => {
    render(<ClientTodo />);
    const row = await screen.findByText("Learn Vitest");
    const tr = row.closest("tr")!;
    const delBtn = within(tr).getByRole("button", { name: /delete/i });
    await userEvent.click(delBtn);
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });
});
