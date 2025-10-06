// app/todo/page.tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import ClientTodo from "./clientTodo";

export default async function TodoPage() {
  const supabase = await createClient();
  const { data: todos } = await supabase
    .from("todos")
    .select("id,title,deleted,created_at")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  // CREATE
  async function createTodo(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    await supabase.from("todos").insert({ title });
    revalidatePath("/todo");
  }

  // DELETE (soft-delete: deleted=true)
  async function deleteTodo(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = Number(formData.get("id"));
    if (!id) return;
    await supabase.from("todos").update({ deleted: true }).eq("id", id);
    revalidatePath("/todo");
  }

  return (
    <div className="space-y-10 p-6 max-w-3xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">TODO</h1>
        <p className="text-gray-600">Server (SSR) üleval, Client (CSR) all.</p>
      </header>

      {/* CREATE (server action) */}
      <form action={createTodo} className="flex gap-2">
        <input
          name="title"
          placeholder="Add a task…"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
        >
          Add
        </button>
      </form>

      {/* READ + DELETE (server action) */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Server list</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {todos?.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2">{t.id}</td>
                  <td className="px-4 py-2">{t.title}</td>
                  <td className="px-4 py-2">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <form action={deleteTodo}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {(!todos || todos.length === 0) && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={4}>
                    No todos yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CLIENT blokk */}
      <ClientTodo />
    </div>
  );
}
