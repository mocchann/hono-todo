import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/index.js";
import { methodOverride } from "hono/method-override";

const app = new Hono();
const prisma = new PrismaClient();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

type Todo = {
  id: number;
  name: string | null;
};

type Todos = Todo[];

/**
 * index
 */

const getTodos = async () => {
  return await prisma.todos.findMany();
};

app.get("/todo", async (c) => {
  const todos = await getTodos();

  return c.html(<TodoList todos={todos} />);
});

const TodoList = ({ todos }: { todos: Todos }) => {
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
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.name} <a href={`/todo/edit/${todo.id}`}>Edit</a>
              <form action="/todo/delete" method="post">
                <input type="hidden" name="_method" value="DELETE" />
                <input type="hidden" name="input" value={todo.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
};

/**
 * create
 */

const createTodo = async (todo: string) => {
  await prisma.todos.create({
    data: {
      name: todo,
    },
  });
};

app.post("/todo", async (c) => {
  const formData = await c.req.parseBody();
  const todoItem = formData.input;

  if (todoItem && typeof todoItem === "string") {
    createTodo(todoItem);
  }

  return c.redirect("/todo");
});

/**
 * edit
 */

const getTodo = async (todoId: number) => {
  return await prisma.todos.findUnique({
    where: {
      id: todoId,
    },
  });
};

app.get("/todo/edit/:id", async (c) => {
  const todoId = Number(c.req.param("id"));
  const todo = await getTodo(todoId);

  if (!todo) {
    return c.text("Todo not found", 404);
  }

  return c.html(<Todo todo={todo} />);
});

const Todo = ({ todo }: { todo: Todo }) => {
  return (
    <html>
      <head>
        <title>Edit Todo</title>
      </head>
      <body>
        <h1>Edit Todo</h1>
        <form action={`/todo/edit/${todo.id}`} method="post">
          <input type="text" name="newName" value={`${todo.name}`} />
          <button type="submit">Save</button>
        </form>
      </body>
    </html>
  );
};

/**
 * update
 */

const updateTodo = async (todoId: number, newName: string) => {
  await prisma.todos.update({
    where: {
      id: todoId,
    },
    data: {
      name: newName,
    },
  });
};

app.post("/todo/edit/:id", async (c) => {
  const todoId = Number(c.req.param("id"));
  const formData = await c.req.parseBody();
  const newName = formData.newName;

  if (newName && typeof newName === "string") {
    updateTodo(todoId, newName);
  }

  return c.redirect("/todo");
});

/**
 * delete
 */

const deleteTodo = async (todoId: number) => {
  await prisma.todos.delete({
    where: {
      id: todoId,
    },
  });
};

app.use("/todo/delete", methodOverride({ app }));

app.delete("/todo/delete", async (c) => {
  const formData = await c.req.parseBody();
  const todoId = Number(formData.input);

  if (todoId) {
    await deleteTodo(todoId);
  }

  return c.redirect("/todo");
});

/**
 * server initialization
 */

serve(app);

process.on("beforeExit", async () => {
  console.log("Disconnecting Prisma client...");
  await prisma.$disconnect();
});
