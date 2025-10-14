import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import ClientProject from "./clientproject"; // ← kliendikomponent samal lehel

async function createProject(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");

  const { error } = await supabase
    .from("projects")
    .insert({ name, user_id: user.id });
  if (error) throw error;

  revalidatePath("/projects");
}

async function updateProject(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) throw new Error("Missing fields");

  const { error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/projects");
}

async function deleteProject(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/projects");
}

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <div className="p-6">Logi sisse.</div>;

  const { data: items, error } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error)
    return <div className="p-6 text-red-600">Viga: {error.message}</div>;

  return (
    <section className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm opacity-70">Projektide esitamise lehekülg</p>
      </header>

      {/* --- SERVER CRUD --- */}
      <section className="space-y-4 border rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold">Server</h2>

        {/* CREATE */}
        <form action={createProject} className="flex gap-2">
          <input
            name="name"
            placeholder="Project name"
            className="border rounded px-3 py-2 flex-1"
          />
          <button className="border rounded px-3 py-2">Add</button>
        </form>

        {/* LIST + UPDATE + DELETE */}
        <ul className="space-y-3">
          {(items ?? []).map((p) => (
            <li key={p.id} className="border rounded p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium flex-1">{p.name}</span>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="border rounded px-2 py-1">Delete</button>
                </form>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm opacity-80">
                  Rename
                </summary>
                <form action={updateProject} className="mt-2 flex gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    name="name"
                    defaultValue={p.name}
                    className="border rounded px-3 py-2 flex-1"
                  />
                  <button className="border rounded px-3 py-2">Save</button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* --- CLIENT CRUD --- */}
      <section className="space-y-4 border rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold">Client</h2>
        <ClientProject />
      </section>
    </section>
  );
}
