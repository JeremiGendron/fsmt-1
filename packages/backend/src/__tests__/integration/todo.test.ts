import { Server } from "http";
import Axios from "axios";
import { disconnect } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-global";
import { setup } from "../../main";
import { todos } from "../__fixtures__/todos";
import { GetTodoResponseData, PostTodoResponseData, GetTodosResponseData } from "../../routes/todos";
import { PostTodoRequestBody } from "../../routes/todos";
import { uuidRegex } from "../__fixtures__/constants";
import { TEST_PORT } from "../../constants";

let server: Server;
let mongoDb: MongoMemoryServer;

beforeEach(async () => {
  mongoDb = new MongoMemoryServer();
  server = await setup(await mongoDb.getUri());
});

afterEach(async () => {
  await disconnect();
  await mongoDb.stop();
  server.close();
});

describe("Interaction between POST and GET single todo", () => {
  it("should properly retrieve a posted todo", async () => {
    const initialTodo = todos[0];
    const postTodoRequestBody: PostTodoRequestBody = {
      content: initialTodo.content,
      tags: initialTodo.tags,
    };
    const postResponse = await Axios.post<PostTodoResponseData>(
      `http://localhost:${TEST_PORT}/todo`,
      postTodoRequestBody,
    );
    expect(postResponse.status).toBe(200);
    const postedTodoId = postResponse.data.body;
    expect(postedTodoId).toMatch(uuidRegex);
    const getResponse = await Axios.get<GetTodoResponseData>(`http://localhost:${TEST_PORT}/todo/${postedTodoId}`);
    expect(getResponse.status).toBe(200);
    const getTodo = getResponse.data.body;
    expect({ content: getTodo?.content, tags: getTodo?.tags }).toMatchObject(postTodoRequestBody);
    expect(getTodo?.created).toBeGreaterThan(initialTodo.created);
  });
});

describe("Interaction between posting todos and retrieving all of them afterwards", () => {
  it("should post and retrieve multiple todos", async () => {
    const postedTodoIds: string[] = [];
    await Promise.all(
      todos.map(async (originalTodo) => {
        const postTodoRequestBody: PostTodoRequestBody = { content: originalTodo.content, tags: originalTodo.tags };
        const postResponse = await Axios.post<PostTodoResponseData>(
          `http://localhost:${TEST_PORT}/todo`,
          postTodoRequestBody,
        );
        expect(postResponse.status).toBe(200);
        postedTodoIds.push(postResponse.data.body || "");
      }),
    );
    const getResponse = await Axios.get<GetTodosResponseData>(`http://localhost:${TEST_PORT}/todos`);
    expect(getResponse.status).toBe(200);
    getResponse.data.body?.forEach(({ todoId: getTodoId }) => {
      expect(postedTodoIds.includes(getTodoId)).toBe(true);
    });
  });
});

describe("Interaction between posting a todo and deleting it", () => {
  it("should post and delete a single todo", async () => {
    const initialTodo = todos[0];
    const postTodoRequestBody: PostTodoRequestBody = {
      content: initialTodo.content,
      tags: initialTodo.tags,
    };
    const postResponse = await Axios.post<PostTodoResponseData>(
      `http://localhost:${TEST_PORT}/todo`,
      postTodoRequestBody,
    );
    expect(postResponse.status).toBe(200);
    const postedTodoId = postResponse.data.body;
    expect(postedTodoId).toMatch(uuidRegex);
    const deleteResponse = await Axios.delete(`http://localhost:${TEST_PORT}/todo/${postedTodoId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data).toBeFalsy();
  });
});
