// app/notes/api/route.ts
export async function GET() {
  return Response.json({ message: "GET: notes endpoint working" });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Response.json({ message: "POST received", data: body });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Response.json({ message: "PUT received", data: body });
}

export async function DELETE() {
  return Response.json({ message: "DELETE received" });
}
