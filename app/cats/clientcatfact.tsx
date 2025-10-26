"use client";

import { useEffect, useState } from "react";

type CatApiResponse = {
  fact: string;
  length: number;
};

export default function ClientCatFact({
  initialFact,
}: {
  initialFact: string;
}) {
  const [fact, setFact] = useState(initialFact);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNewFact() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("https://catfact.ninja/fact");
      if (!res.ok) {
        throw new Error("Bad response from API");
      }
      const data: CatApiResponse = await res.json();
      setFact(data.fact);
    } catch (error) {
      setError("Failed to load new fact 🙀");
    } finally {
      setLoading(false);
    }
  }

  // (boonus) laadime automaatselt uue fakti kui komponent mountib
  // kui sa ei taha automaatselt laadida vaid ainult nupuga, siis eemalda useEffect
  useEffect(() => {
    // kui tahame kohe refetchida mountimisel, kommenteeri see lahti:
    // loadNewFact();
  }, []);

  return (
    <div className="space-y-3 border-t pt-4">
      <h2 className="text-lg font-medium">Client Component fact</h2>

      <pre className="text-sm bg-gray-100 rounded p-3 whitespace-pre-wrap min-h-[4rem]">
        {loading ? "Loading..." : error ? error : fact}
      </pre>

      <button
        onClick={loadNewFact}
        disabled={loading}
        className="rounded border px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Fetching..." : "🔄"}
      </button>

      <p className="text-sm text-gray-500"></p>
    </div>
  );
}
