import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { TESTNETS_ENABLED } from "@/app/constants";
import { Alchemy, Network } from "alchemy-sdk";
import { INSCRIBED_DROPS_CONTRACT } from "@/components/core/net-apps/inscribed-drops/constants";

const settings = {
  apiKey: TESTNETS_ENABLED
    ? process.env["NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_ID"]
    : process.env["NEXT_PUBLIC_ALCHEMY_BASE_ID"],
  network: TESTNETS_ENABLED ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

async function processRequest(url: string, req: NextRequest) {
  try {
    let buffer;
    if (url.startsWith("data:")) {
      console.log("WOAH!");
      // Attempt to parse data uri
      const commaIdx = url.indexOf(",");
      if (commaIdx === -1) {
        return Response.json(
          { error: "Failed to parse data uri" },
          { status: 400 }
        );
      }
      const encodedData = url.substring(commaIdx + 1);
      // TODO buffer may not even be needed
      buffer = Buffer.from(encodedData, "base64");
      const decodedSvg = atob(encodedData);
      // return new ImageResponse(
      // (
      //   <>
      //     <div dangerouslySetInnerHTML={{ __html: decodedSvg as string }} />
      //   </>
      // )
      // );
      const metadata = await alchemy.nft.getNftMetadata(
        INSCRIBED_DROPS_CONTRACT.address,
        23
      );
      console.log(metadata);
      const cachedUrl = metadata.image.cachedUrl;
      if (cachedUrl != null) {
        console.log("RETUNRING!");
        const response = await fetch(cachedUrl);
        buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
          headers: { "Content-Type": "image/svg+xml" },
        });
      }
    } else {
      const response = await fetch(url);
      buffer = await response.arrayBuffer();
    }
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
