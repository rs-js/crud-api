import supertest, { SuperTest, Test } from "supertest";
import { Server, createServer } from "http";
import { app } from "../src/app";
import "dotenv/config";
// import { port, host } from "..";

describe("crud-api tests", () => {
  describe("users", () => {
    let server: Server;
    let request: SuperTest<Test>;
    let id: string;
    const mockUser = {
      username: "testUser",
      age: 20,
      hobbies: ["testHobbie"],
    };

    beforeAll((done) => {
      const host = process.env.HOST;
      const port = process.env.PORT;
      server = createServer(app);
      server.listen(port, done);
      request = supertest(`${host}:${port}/api/`);
    });

    afterAll((done) => {
      server.close(done);
    });

    it("getUsers", async () => {
      const response = await request
        .get("users")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("createUser", async () => {
      const response = await request
        .post("users")
        .send(mockUser)
        .set("Accept", "application/json");

      expect(response.status).toBe(201);
      id = response.body.id;
      expect(response.body).toEqual({ ...mockUser, id });
    });

    it("getUserById", async () => {
      const response = await request
        .get(`users/${id}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUser, id });
    });

    it("updateUser", async () => {
      const updatedUser = {
        username: "testUser2",
        age: 23,
        hobbies: ["testHobbie2"],
      };
      const response = await request
        .put(`users/${id}`)
        .send(updatedUser)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...updatedUser, id: response.body.id });
    });

    it("deleteUser", async () => {
      const response = await request.delete(`users/${id}`);

      expect(response.status).toBe(204);
    });

    it("getUserByDeletedId", async () => {
      const response = await request
        .get(`users/${id}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(404);
      expect(response.text).toEqual(`no such user with id:${id}`);
    });
  });
});
