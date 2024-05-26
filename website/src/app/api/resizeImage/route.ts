import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("imageUrl");
  if (url == null) {
    return Response.json({ error: "Failed to parse url" }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // TODO adjust this
    const maxWidth = 1000;
    const maxHeight = 1000;
    if (metadata.width == null || metadata.height == null) {
      return Response.json(
        { error: "Failed to identify image width or height" },
        { status: 500 }
      );
    }

    const aspectRatio = metadata.width / metadata.height;

    // Determine the target width and height
    let targetWidth, targetHeight;
    if (metadata.width / maxWidth > metadata.height / maxHeight) {
      targetWidth = maxWidth;
      targetHeight = Math.round(maxWidth / aspectRatio);
    } else {
      targetWidth = Math.round(maxHeight * aspectRatio);
      targetHeight = maxHeight;
    }

    const resizedImageBuffer = await image
      .resize({
        // Frame image aspect ratio is 1.91:1 and 1170/612 is approximately 1.91:1.
        // This width and height are double the width of frames on my mac so they should
        // preserve image quality where possible.
        // NOTE: I could be wrong on the quality part, I'm no expert on image resizing
        width: 1170,
        height: 612,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background
      })
      .toBuffer();

    // Set the content type and return the image
    return new NextResponse(resizedImageBuffer, {
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (e) {
    console.log(e);
    return Response.json({ error: "Failed to resize" }, { status: 500 });
  }
}
