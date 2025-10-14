// __tests__/clientProjects.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientProjects from "@/app/projects/clientproject";

type Row = { id: string; name: string; created_at: string };
const now = new Date().toISOString();
let DATA: Row[] = [{ id: "1", name: "First project", created_at: now }];

function makeFetchMock() {
  return vi
    .fn()
    .mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const method = (init?.method || "GET").toUpperCase();

        // LIST
        if (url.startsWith("/projects/api") && method === "GET") {
          return new Response(JSON.stringify(DATA), { status: 200 });
        }

        // CREATE
        if (url.startsWith("/projects/api") && method === "POST") {
          const body = init?.body ? JSON.parse(init.body as string) : {};
          const row: Row = {
            id: String(Math.max(0, ...DATA.map((d) => Number(d.id))) + 1),
            name: String(body.name ?? "").trim(),
            created_at: now,
          };
          if (!row.name)
            return new Response(JSON.stringify({ error: "Name required" }), {
              status: 400,
            });
          DATA = [row, ...DATA];
          return new Response(JSON.stringify(row), { status: 201 });
        }

        // UPDATE
        if (url.startsWith("/projects/api") && method === "PUT") {
          const body = init?.body ? JSON.parse(init.body as string) : {};
          const { id, name } = body as { id: string; name: string };
          if (!id || !String(name).trim())
            return new Response(JSON.stringify({ error: "Missing fields" }), {
              status: 400,
            });
          DATA = DATA.map((d) =>
            d.id === id ? { ...d, name: String(name).trim() } : d
          );
          const updated = DATA.find((d) => d.id === id) || null;
          return new Response(JSON.stringify(updated), { status: 200 });
        }

        // DELETE
        if (url.startsWith("/projects/api") && method === "DELETE") {
          const parsed = new URL("http://x" + url); // lihtne võte query saamiseks
          const id = parsed.searchParams.get("id") || "";
          DATA = DATA.filter((d) => d.id !== id);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        return new Response("Not found", { status: 404 });
      }
    );
}

beforeEach(() => {
  DATA = [{ id: "1", name: "First project", created_at: now }];
  vi.restoreAllMocks();
  // @ts-expect-error override
  global.fetch = makeFetchMock();
});

describe("ClientProjects", () => {
  it("renders initial list", async () => {
    render(<ClientProjects />);
    expect(await screen.findByText("First project")).toBeInTheDocument();
  });

  it("creates a project", async () => {
    render(<ClientProjects />);
    const input = await screen.findByPlaceholderText("Project name");
    await userEvent.type(input, "New site");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(await screen.findByText("New site")).toBeInTheDocument();
  });

  it("renames a project", async () => {
    render(<ClientProjects />);
    const row = await screen.findByText("First project");
    const li = row.closest("li")!;
    // käivitame prompti mocki
    vi.spyOn(window, "prompt").mockReturnValue("Renamed project");
    const renameBtn = within(li).getByRole("button", { name: /rename/i });
    await userEvent.click(renameBtn);
    expect(await screen.findByText("Renamed project")).toBeInTheDocument();
  });

  it("deletes a project", async () => {
    render(<ClientProjects />);
    const row = await screen.findByText("First project");
    const li = row.closest("li")!;
    const delBtn = within(li).getByRole("button", { name: /delete/i });
    await userEvent.click(delBtn);
    // pärast kustutamist ei ole ühtegi rida – komponent ei kuva tühja-teksti,
    // seega kontrollime, et varasem tekst kaob:
    expect(screen.queryByText("First project")).not.toBeInTheDocument();
  });
});
