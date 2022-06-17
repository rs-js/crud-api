import { IncomingMessage, ServerResponse } from "http";
import { User } from "./interfaces/user";
import { v4 as uuidv4, validate } from "uuid";

let users: User[] = [];

export const app = (req: IncomingMessage, res: ServerResponse) => {
  process.on("uncaughtException", () => {
    res.writeHead(500).write("Something goes wrong");
    res.end();
  });

  const jsonType = { "Content-Type": "application/json" };
  const userId = req?.url?.split("/")[3];

  const checkUser = () => {
    const user = users.find(({ id }) => id === userId);
    if (userId && !validate(userId)) {
      res.writeHead(400);
      res.write("userId is invalid");
      return null;
    } else if (!user) {
      res.writeHead(404);
      res.write(`no such user with id:${userId}`);
      return null;
    } else {
      return user;
    }
  };

  const validateRequest = (data: any): Omit<User, "id"> | null => {
    const user: Omit<User, "id"> = JSON.parse(data);
    if (user.age && user.username && Array.isArray(user.hobbies)) {
      return user;
    } else {
      res.writeHead(400).write("Wrong body");
      return null;
    }
  };

  if (req.url?.startsWith("/api/users")) {
    switch (req.method) {
      case "GET":
        if (userId) {
          const user = checkUser();
          if (user) {
            res.writeHead(200, jsonType);
            res.write(JSON.stringify(user));
          }
        } else {
          res.writeHead(200, jsonType);
          res.write(JSON.stringify(users));
        }
        res.end();
        break;
      case "POST":
        req.on("data", (data) => {
          const userData = validateRequest(data);
          if (userData) {
            const user = { ...userData, id: uuidv4() };
            users.push(user);
            res.writeHead(201, jsonType);
            res.write(JSON.stringify(user));
          }
        });
        req.on("end", () => {
          res.end();
        });
        break;
      case "PUT":
        req.on("data", (data) => {
          const updatedUser = validateRequest(data);
          if (checkUser() && updatedUser && userId) {
            const userData = { ...updatedUser, id: userId };
            users = users.map((user) => (user.id === userId ? userData : user));
            res.writeHead(200, jsonType).write(JSON.stringify(userData));
          }
          req.on("end", () => {
            res.end();
          });
        });
        break;
      case "DELETE":
        if (checkUser()) {
          users = users.filter(({ id }) => id !== userId);
          res.writeHead(204);
        }
        res.end();
        break;
    }
  } else {
    res.writeHead(404).write("Page is not found.");
    res.end();
  }
};
