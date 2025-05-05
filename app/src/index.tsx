import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const Todo = () => {
  return (
    <html>
      <head>
        <title>Hono Todo App</title>
      </head>
      <body>
        <h1>Hono Todo App</h1>
        <form action="/todo" method="post">
          <input type="text" name="input" />
          <button type="submit">Add Todo</button>
        </form>
      </body>
    </html>
  );
};

app.get("/todo", (c) => {
  return c.html(<Todo />);
});

app.post("/todo", async (c) => {
  const formData = await c.req.parseBody();
  const todoItem = formData.input;

  return c.redirect("/todo");
});

serve(app);
