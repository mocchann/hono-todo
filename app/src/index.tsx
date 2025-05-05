import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";

const app = new Hono();

/**
 * verification route
 */
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/hello", (c) => {
  return c.json({
    ok: true,
    message: "hello hono api!",
  });
});

app.get("/posts/:id", (c) => {
  const page = c.req.query("page");
  const id = c.req.param("id");
  c.header("X-Message", "Hi!");
  return c.text(`You want to see ${page} of ${id}`);
});
app.post("/posts", (c) => c.text("Created!", 201));
app.delete("/posts/:id", (c) => c.text(`${c.req.param("id")} is deleted!`));

app.use(
  "/admin/*",
  basicAuth({
    username: "admin",
    password: "secret",
  })
);

app.get("/admin", (c) => {
  return c.text("You are Authorized!");
});

/**
 * todo app route
 */
app.get("/todo", (c) => c.html(<Todo />));
app.post("/todo", async (c) => {
  const data = await c.req.formData();
  const name = data.get("input");

  return c.redirect("/todo");
});

const Todo = () => {
  return (
    <html>
      <body>
        <h1>hono todo application</h1>
        <form action="/todo" method="post">
          <input type="text" name="input" placeholder="Input todo item" />
          <button type="submit">Add Todo</button>
        </form>
      </body>
    </html>
  );
};

export default app;
