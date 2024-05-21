import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";

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
  return c.send({
    chainId: "eip155:10",
    to: "0xd2135CfB216b74109775236E36d4b433F1DF507B",
    value: parseEther(inputText),
  });
});

devtools(app, { serveStatic });
