"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Note = { id: number; title: string; created_at: string };

export default function ClientNotes() {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");

  // Fetch notes
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotes() {
    const { data } = await supabase
      .from("notes")
      .select("id,title,created_at")
      .order("created_at", { ascending: false });
    setNotes(data ?? []);
  }

  // Create note
  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await supabase.from("notes").insert({ title });
    setTitle("");
    fetchNotes();
  }

  // Delete note
  async function deleteNote(id: number) {
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  }

  return (
    <section className="space-y-4 border rounded-xl p-4">
      <h2 className="text-xl font-bold">Client Component Notes</h2>

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
          className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
        >
          Add
        </button>
      </form>

      {/* LIST + DELETE */}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            {n.title}
            <button
              onClick={() => deleteNote(n.id)}
              className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </li>
        ))}
        {notes.length === 0 && <li className="text-gray-500">No notes yet.</li>}
      </ul>
    </section>
  );
}
