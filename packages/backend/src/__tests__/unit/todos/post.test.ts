import { Server } from "http";
import Axios, { AxiosError } from "axios";
import { disconnect } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-global";
import { setup } from "../../../main";
import { PostTodoResponseData, PostTodoRequestBody } from "../../../routes/todos";
import { todos } from "../../__fixtures__/todos";
import { uuidRegex } from "../../__fixtures__/constants";
import { TEST_PORT } from "../../../constants";

let server: Server;
let mongoDb: MongoMemoryServer;

const postTodoRequestBody: PostTodoRequestBody = {
  content: todos[0].content,
  tags: todos[0].tags,
};

beforeEach(async () => {
  mongoDb = new MongoMemoryServer();
  server = await setup(await mongoDb.getUri());
});

afterEach(async () => {
  await disconnect();
  await mongoDb.stop();
  server.close();
});

describe("Post todo", () => {
  it("should return 200 status and a valid uuid", async () => {
    const response = await Axios.post<PostTodoResponseData>(`http://localhost:${TEST_PORT}/todo`, postTodoRequestBody);
    expect(response.status).toBe(200);
    expect(response.data.body).toMatch(uuidRegex);
    expect(response.data.error).not.toBeDefined();
  });
  it("should fail with 400 bad request", async () => {
    try {
      const response = await Axios.post<PostTodoResponseData>(`http://localhost:${TEST_PORT}/todo`, {
        content: postTodoRequestBody.content,
        tags: "",
      });
      expect(response.status).toBe(400);
      expect(response.data.error).toBe("Invalid field provided: tags");
    } catch (e) {
      const error = e as AxiosError;
      expect(error.response?.status).toBe(400);
      expect(error.response?.data.error).toMatch(/tags/);
    }
  });
});
