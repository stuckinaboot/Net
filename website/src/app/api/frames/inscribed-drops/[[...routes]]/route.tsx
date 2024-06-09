/** @jsxImportSource frog/jsx */

import {
  getResizedImageUrl,
  openSeaChainStringToCrossChainId,
} from "@/app/utils";
import { INSCRIBED_DROPS_CONTRACT } from "@/components/core/net-apps/inscribed-drops/constants";
import {
  getFrameImageUrl,
  getInscribedDrop,
} from "@/components/core/net-apps/inscribed-drops/utils";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/next";
import { parseEther } from "viem";
import { IPFS_GATEWAY, sanitizeMediaUrl } from "@/components/core/utils";

const app = new Frog({
  basePath: "/api/frames/inscribed-drops",
});

app.frame("/:chainId/:tokenId", async (c) => {
  const { status } = c;
  const title = status === "response" ? "Minted on Net!" : "";

  // NOTE: we intentionally use `param` here instead of `query` to ensure that we
  // get param values, as it seems passing by query value is not supported here (despite being
  // supported in transactions)
  const openSeaChainId = c.req.param("chainId");
  const tokenId = c.req.param("tokenId");

  if (openSeaChainId == null || tokenId == null) {
    throw new Error("Missing params");
  }

  const crossChainId = openSeaChainStringToCrossChainId(openSeaChainId);
  if (crossChainId == null) {
    throw new Error("Missing cross chain id");
  }

  const drop = await getInscribedDrop({
    chainIdString: openSeaChainId,
    tokenId,
  });

  const frameImageUrl = await getFrameImageUrl({
    imageUrl: drop?.metadata.image || "",
    tokenId,
    chain: openSeaChainId,
  });

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          backgroundSize: "100% 100%",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <img src={frameImageUrl} style={{ position: "absolute" }} />
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
            backgroundColor: "black",
            textAlign: "center",
          }}
        >
          {title}
        </div>
      </div>
    ),
    intents: [
      <TextInput key={0} placeholder="Amount to mint (default 1)" />,
      <Button.Transaction
        key={1}
        target={`/mint?chainId=${openSeaChainId}&tokenId=${tokenId}`}
        action={`/${openSeaChainId}/${tokenId}`}
      >
        Mint again
      </Button.Transaction>,
    ],
  });
});

app.transaction("/mint", async (c) => {
  const { inputText } = c;
  let quantity;
  try {
    quantity = BigInt(parseInt(inputText || "1"));
  } catch (e) {
    throw new Error("Invalid quantity");
  }
  const openSeaChainId = c.req.query("chainId");
  const tokenId = c.req.query("tokenId");

  if (openSeaChainId == null || tokenId == null) {
    throw new Error("Missing params");
  }

  const crossChainId = openSeaChainStringToCrossChainId(openSeaChainId);
  if (crossChainId == null) {
    throw new Error("Missing cross chain id");
  }

  const drop = await getInscribedDrop({
    chainIdString: openSeaChainId,
    tokenId,
  });
  if (drop == null) {
    throw new Error("Missing drop");
  }

  const totalPrice =
    BigInt(parseEther(drop?.mintConfig.priceInEth.toString())) *
    BigInt(quantity);

  return c.contract({
    to: INSCRIBED_DROPS_CONTRACT.address as any,
    abi: INSCRIBED_DROPS_CONTRACT.abi,
    chainId: crossChainId as any,
    functionName: "mint",
    args: [BigInt(tokenId), quantity],
    value: totalPrice,
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
