import request from "supertest";
import initApp from "../index";
import commentsModel from "../models/commentModel";
import { Express } from "express";
import { getLogedInUser, UserData } from "./utils";

let app: Express;
let loginUser: UserData;
let commentId = "";

beforeAll(async () => {
  app = await initApp();
  await commentsModel.deleteMany();
  loginUser = await getLogedInUser(app);
});

afterAll((done) => {
  done();
});

type CommentData = {
  message: string;
  postId: string;
  sender?: string;
  _id?: string;
};

const commentsList: CommentData[] = [
  {
    message: "this is my comment",
    postId: "507f1f77bcf86cd799439011",
  },
  {
    message: "this is my second comment",
    postId: "507f1f77bcf86cd799439012",
  },
  {
    message: "this is my third comment",
    postId: "507f1f77bcf86cd799439013",
  },
  {
    message: "this is my fourth comment",
    postId: "507f1f77bcf86cd799439013",
  },
];

describe("Sample Test Suite", () => {
  test("Initial empty comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create Comment", async () => {
    for (const comment of commentsList) {
      const response = await request(app)
        .post("/comment")
        .set("Authorization", "Bearer " + loginUser.token)
        .send(comment);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe(comment.message);
      expect(response.body.postId).toBe(comment.postId);
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
    }
  });

  test("Get All Comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
  });

  test("Get Comments by postId", async () => {
    const response = await request(app).get(
      "/comment?postId=" + commentsList[0].postId,
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].message).toBe(commentsList[0].message);
    expect(response.body[0].sender._id).toBe(loginUser._id);
    commentId = response.body[0]._id;
  });

  test("Get Comment by ID", async () => {
    const response = await request(app).get("/comment/" + commentId);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(commentsList[0].message);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body.sender._id).toBe(loginUser._id);
    expect(response.body.sender).toHaveProperty("userName");
    expect(response.body._id).toBe(commentId);
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
  });

  test("Update Comment", async () => {
    commentsList[0].message = "This is an updated comment";
    commentsList[0].postId = "507f1f77bcf86cd799439044";
    const response = await request(app)
      .put("/comment/" + commentId)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(commentsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(commentsList[0].message);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body._id).toBe(commentId);
  });

  test("Delete Comment", async () => {
    const response = await request(app)
      .delete("/comment/" + commentId)
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(commentId);

    const getResponse = await request(app).get("/comment/" + commentId);
    expect(getResponse.status).toBe(404);
  });
});
