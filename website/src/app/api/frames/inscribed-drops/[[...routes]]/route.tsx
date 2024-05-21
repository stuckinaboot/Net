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

devtools(app, { serveStatic });
