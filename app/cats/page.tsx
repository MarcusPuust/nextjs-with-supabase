// app/cats/page.tsx
import ClientCatFact from "./clientcatfact";

type CatApiResponse = {
  fact: string;
  length: number;
};

export default async function CatsPage() {
  // 1. Fetch 3rd party API SERVERI POOL
  const res = await fetch("https://catfact.ninja/fact", {
    // No-store = alati värske, mitte cache'ist
    cache: "no-store",
  });

  if (!res.ok) {
    // Vigade käsitlemine, et build ei plahvataks
    throw new Error("Failed to fetch cat fact");
  }

  const data: CatApiResponse = await res.json();

  return (
    <section className="space-y-6 max-w-md mx-auto border rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-semibold">Cat Facts</h1>

      {/* SERVERI fetchitud fakt */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Server Component fact</h2>
        <pre className="text-sm bg-gray-100 rounded p-3 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
        <p className="text-sm text-gray-500"></p>
      </div>

      {/* CLIENT komponent, mis fetchib brauseris uuesti */}
      <ClientCatFact initialFact={data.fact} />
    </section>
  );
}
