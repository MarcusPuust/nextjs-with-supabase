"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Todo = {
  id: number;
  title: string;
  deleted: boolean;
  created_at: string;
};

export default function ClientTodo() {
  const supabase = createClient();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // READ
  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("todos")
      .select("id,title,deleted,created_at") // ← no is_done
      .eq("deleted", false)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setTodos(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CREATE
  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("todos")
      .insert({ title: t })
      .select()
      .single();

    if (error) setError(error.message);
    if (data) {
      setTodos((prev) => [data as Todo, ...prev]);
      setTitle("");
    }
    setCreating(false);
  };

  // DELETE (soft-delete)
  const deleteTodo = async (id: number) => {
    const prev = todos;
    setTodos((p) => p.filter((t) => t.id !== id)); // optimistic UI
    const { error } = await supabase
      .from("todos")
      .update({ deleted: true })
      .eq("id", id);
    if (error) {
      setTodos(prev); // revert
      setError(error.message);
    }
  };

  // Edit mode helpers
  const startEdit = (t: Todo) => {
    setEditingId(t.id);
    setEditingTitle(t.title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  // UPDATE title
  const saveEdit = async (id: number) => {
    const newTitle = editingTitle.trim();
    if (!newTitle) return;

    const prev = todos;
    // optimistic update
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
    setEditingId(null);
    setEditingTitle("");

    const { error } = await supabase
      .from("todos")
      .update({ title: newTitle })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setTodos(prev); // revert on error
      setError(error.message);
    }
  };

  return (
    <section className="space-y-4 border rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Client list</h2>
        <button
          onClick={load}
          className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading…" : "Reload"}
        </button>
      </div>

      {/* CREATE */}
      <form onSubmit={createTodo} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
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

      {/* LIST */}
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
            {todos.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>

                {/* Title cell with inline edit */}
                <td className="px-4 py-2">
                  {editingId === t.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(t.id)}
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
                    <span>{t.title}</span>
                  )}
                </td>

                <td className="px-4 py-2">
                  {new Date(t.created_at).toLocaleString()}
                </td>

                {/* Actions */}
                <td className="px-4 py-2">
                  {editingId === t.id ? null : (
                    <button
                      onClick={() => startEdit(t)}
                      className="rounded border px-2 py-1 hover:bg-gray-50 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {todos.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                  No todos yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Uses soft-delete. Update (edit) requires an UPDATE RLS policy for
        owners.
      </p>
    </section>
  );
}
