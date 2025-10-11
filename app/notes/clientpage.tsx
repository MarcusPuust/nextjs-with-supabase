"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Note = { id: number; title: string; created_at: string };

export default function ClientNotes() {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // READ
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("notes")
      .select("id,title,created_at")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setNotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CREATE
  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("notes")
      .insert({ title: t })
      .select()
      .single();

    if (error) setError(error.message);
    if (data) {
      setNotes((prev) => [data as Note, ...prev]);
      setTitle("");
    }
    setCreating(false);
  };

  // DELETE
  const deleteNote = async (id: number) => {
    const prev = notes;
    setNotes((p) => p.filter((n) => n.id !== id)); // optimistic
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      setNotes(prev);
      setError(error.message);
    }
  };

  // EDIT helpers
  const startEdit = (n: Note) => {
    setEditingId(n.id);
    setEditingTitle(n.title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  // UPDATE title
  const saveEdit = async (id: number) => {
    const newTitle = editingTitle.trim();
    if (!newTitle) return;

    const prev = notes;
    // optimistic update
    setNotes((p) =>
      p.map((n) => (n.id === id ? { ...n, title: newTitle } : n))
    );
    setEditingId(null);
    setEditingTitle("");

    const { error } = await supabase
      .from("notes")
      .update({ title: newTitle })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setNotes(prev); // revert
      setError(error.message);
    }
  };

  return (
    <section className="space-y-4 border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Client Component Notes</h2>
        <button
          onClick={fetchNotes}
          disabled={loading}
          className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Reload"}
        </button>
      </div>

      {/* CREATE */}
      <form onSubmit={addNote} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New note title..."
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {creating ? "Adding…" : "Add"}
        </button>
      </form>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LIST + EDIT + DELETE */}
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
            {notes.map((n) => (
              <tr key={n.id} className="border-t">
                <td className="px-4 py-2">{n.id}</td>
                <td className="px-4 py-2">
                  {editingId === n.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(n.id)}
                        className="rounded border px-2 py-1 hover:bg-gray-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded border px-2 py-1 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>{n.title}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {new Date(n.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {editingId === n.id ? null : (
                    <button
                      onClick={() => startEdit(n)}
                      className="rounded border px-2 py-1 hover:bg-gray-50 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {notes.length === 0 && !loading && (
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
  );
}
