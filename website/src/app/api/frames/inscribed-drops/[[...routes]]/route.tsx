import { openSeaChainStringToCrossChainId } from "@/app/utils";
import { INSCRIBED_DROPS_CONTRACT } from "@/components/core/net-apps/inscribed-drops/constants";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { parseEther } from "viem";

export const app = new Frog({ basePath: "/api/frames/inscribed-drops" });

// TODO implement
app.frame("/", (c) => {
  const { buttonValue, status } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        {status === "initial"
          ? "Select your fruit!"
          : `Selected: ${buttonValue}`}
      </div>
    ),
    intents: [
      <Button value="apple">Apple</Button>,
      <Button value="banana">Banana</Button>,
      <Button value="mango">Mango</Button>,
    ],
  });
});

app.transaction("/mint", async (c) => {
  const { buttonValue, status } = c;
  // TODO
  const openSeaChainId = "";
  const crossChainId = openSeaChainStringToCrossChainId(openSeaChainId);
  return c.send({
    chainId: crossChainId as any,
    to: INSCRIBED_DROPS_CONTRACT.address as any,
    value: parseEther(""),
  });
});

devtools(app, { serveStatic });
