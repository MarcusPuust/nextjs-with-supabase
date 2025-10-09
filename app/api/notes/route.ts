export async function GET() {
  return Response.json({ message: "GET works" });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function POST() {
  return Response.json({ message: "POST works" });
}

export async function PUT() {
  return Response.json({ message: "PUT works" });
}

export async function DELETE() {
  return Response.json({ message: "DELETE works" });
}
