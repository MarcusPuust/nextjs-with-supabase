// app/notes/page.tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import ClientNotes from "./clientpage";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("notes")
    .select("id,title,created_at")
    .order("created_at", { ascending: false });

  // CREATE
  async function createNote(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    await supabase.from("notes").insert({ title });
    revalidatePath("/notes");
  }

  // DELETE (hard delete)
  async function deleteNote(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = Number(formData.get("id"));
    if (!id) return;
    await supabase.from("notes").delete().eq("id", id);
    revalidatePath("/notes");
  }

  // UPDATE title
  async function updateNote(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = Number(formData.get("id"));
    const title = String(formData.get("title") ?? "").trim();
    if (!id || !title) return;

    await supabase
      .from("notes")
      .update({ title })
      .eq("id", id)
      .select()
      .single();

    revalidatePath("/notes");
  }

  return (
    <div className="space-y-8 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Notes</h1>
      <p className="text-gray-600">Server üleval, Client all.</p>

      {/* CREATE */}
      <form action={createNote} className="flex gap-2">
        <input
          name="title"
          placeholder="New note title..."
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
        >
          Add
        </button>
      </form>

      {/* READ + UPDATE + DELETE (server actions) */}
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
              {notes?.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="px-4 py-2">{n.id}</td>
                  <td className="px-4 py-2">
                    <form action={updateNote} className="flex gap-2">
                      <input
                        name="title"
                        defaultValue={n.title}
                        className="min-w-[10rem] rounded border border-gray-300 px-2 py-1"
                      />
                      <input type="hidden" name="id" value={n.id} />
                      <button className="rounded border px-2 py-1 hover:bg-gray-50">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(n.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <form action={deleteNote}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {(!notes || notes.length === 0) && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={4}>
                    No notes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CLIENT blokk */}
      <ClientNotes />
    </div>
  );
}
