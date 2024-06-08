import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

async function processRequest(url: string, req: NextRequest) {
  try {
    let buffer;
    let decodedSvg;
    if (url.startsWith("data:")) {
      // Attempt to parse data uri
      const commaIdx = url.indexOf(",");
      if (commaIdx === -1) {
        return Response.json(
          { error: "Failed to parse data uri" },
          { status: 400 }
        );
      }
      const encodedData = url.substring(commaIdx + 1);
      buffer = Buffer.from(encodedData, "base64");
      decodedSvg = atob(encodedData);
    } else {
      const response = await fetch(url);
      buffer = await response.arrayBuffer();
    }
    // const image = sharp(buffer);
    // const metadata = await image.metadata();

    // // TODO adjust this
    // const maxWidth = 1000;
    // const maxHeight = 1000;
    // if (metadata.width == null || metadata.height == null) {
    //   return Response.json(
    //     { error: "Failed to identify image width or height" },
    //     { status: 500 }
    //   );
    // }

    // const aspectRatio = metadata.width / metadata.height;

    // // Determine the target width and height
    // let targetWidth, targetHeight;
    // if (metadata.width / maxWidth > metadata.height / maxHeight) {
    //   targetWidth = maxWidth;
    //   targetHeight = Math.round(maxWidth / aspectRatio);
    // } else {
    //   targetWidth = Math.round(maxHeight * aspectRatio);
    //   targetHeight = maxHeight;
    // }

    // const resizedImageBuffer = await image
    //   .resize({
    //     // Frame image aspect ratio is 1.91:1 and 1170/612 is approximately 1.91:1.
    //     // This width and height are double the width of frames on my mac so they should
    //     // preserve image quality where possible.
    //     // NOTE: I could be wrong on the quality part, I'm no expert on image resizing
    //     width: 1170,
    //     height: 612,
    //     fit: "contain",
    //     background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background
    //   })
    //   .toBuffer();

    console.log("OUT!", url);
    // Set the content type and return the image
    return new NextResponse(decodedSvg, {
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (e) {
    console.log(e);
    console.log("FUCK!");
    return Response.json({ error: "Failed to resize" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("imageUrl");
  if (url == null) {
    return Response.json({ error: "Failed to parse url" }, { status: 400 });
  }
  // Important to decode uri component cause url is encoded in the GET request.
  // NOTE: this encoding is totally separate from any "onchain art encoding"
  return processRequest(decodeURIComponent(url), req);
}
