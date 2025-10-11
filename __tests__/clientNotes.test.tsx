import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientNotes from "@/app/notes/clientpage";

type Row = { id: number; title: string; created_at: string };
const now = new Date().toISOString();
let DATA: Row[] = [{ id: 1, title: "First note", created_at: now }];

function mockSupabase() {
  return {
    from: vi.fn().mockImplementation((_table: string) => ({
      // list
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: DATA, error: null }),

      // create: .insert(...).select().single()
      insert: vi.fn().mockImplementation(({ title }: { title: string }) => {
        const row = {
          id: Math.max(0, ...DATA.map((d) => d.id)) + 1,
          title,
          created_at: now,
        };
        DATA = [row, ...DATA];
        return {
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: row, error: null }),
        };
      }),

      // update: .update(...).eq('id', id).select().single()
      update: vi.fn().mockImplementation(({ title }: { title: string }) => ({
        eq: vi.fn().mockImplementation((_field: string, id: number) => {
          DATA = DATA.map((d) => (d.id === id ? { ...d, title } : d));
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
  return { createClient: () => mockSupabase() };
});

beforeEach(() => {
  DATA = [{ id: 1, title: "First note", created_at: now }];
});

describe("ClientNotes", () => {
  it("renders initial notes", async () => {
    render(<ClientNotes />);
    expect(await screen.findByText("First note")).toBeInTheDocument();
  });

  it("creates a note", async () => {
    render(<ClientNotes />);
    const input = await screen.findByPlaceholderText("New note title...");
    await userEvent.type(input, "New shiny note");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(await screen.findByText("New shiny note")).toBeInTheDocument();
  });

  it("edits a note inline", async () => {
    render(<ClientNotes />);
    const row = await screen.findByText("First note");
    const tr = row.closest("tr") || row.closest("li") || row.parentElement!;
    const editBtn = within(tr).getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);
    const editInput = within(tr).getByRole("textbox");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "First note updated");
    await userEvent.click(within(tr).getByRole("button", { name: /save/i }));
    expect(await screen.findByText("First note updated")).toBeInTheDocument();
  });

  it("deletes a note", async () => {
    render(<ClientNotes />);
    const row = await screen.findByText("First note");
    const tr = row.closest("tr") || row.closest("li") || row.parentElement!;
    const delBtn = within(tr).getByRole("button", { name: /delete/i });
    await userEvent.click(delBtn);
    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument();
  });
});
