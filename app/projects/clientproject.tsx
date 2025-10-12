"use client";

import { useEffect, useState } from "react";

type Project = { id: string; name: string; created_at: string };

export default function ClientProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/projects/api", { cache: "no-store" });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    await fetch("/projects/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    await load();
  };

  const rename = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    await fetch("/projects/api", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: newName.trim() }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/projects/api?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="border rounded px-3 py-2 flex-1"
        />
        <button onClick={create} className="border rounded px-3 py-2">
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium flex-1">{p.name}</span>
              <button
                onClick={() => {
                  const v = prompt("New name", p.name) ?? "";
                  rename(p.id, v);
                }}
                className="border rounded px-2 py-1"
              >
                Rename
              </button>
              <button
                onClick={() => remove(p.id)}
                className="border rounded px-2 py-1"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
