import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tokenURI } = body;

  if (tokenURI == null) {
    return Response.json({ error: "Missing tokenURI" }, { status: 500 });
  }

  try {
    const metadataRes = await fetch(tokenURI);
    const json = await metadataRes.json();
    return Response.json({ metadata: json });
  } catch (exception: any) {
    return Response.json({ error: "Error: " + exception?.message });
  }
}
