import request from "supertest";
import initApp from "../index";
import postModel from "../models/postModel";
import { Express } from "express";
import { getLogedInUser, UserData, PostData, postsList } from "./utils";

let app: Express;
let loginUser: UserData;
let postId = "";

beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany();
  loginUser = await getLogedInUser(app);
});

afterAll((done) => {
  done();
});

describe("Sample Test Suite", () => {
  test("Sample Test Case", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create Post", async () => {
    for (const post of postsList) {
      const response = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + loginUser.token)
        .send(post);
      expect(response.status).toBe(201);
      expect(response.body.text).toBe(post.text);
      expect(response.body.img).toBe(post.img);
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
    }
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get Posts by sender", async () => {
    const response = await request(app).get("/post?sender=" + loginUser._id);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
    expect(response.body[0].text).toBe(postsList[0].text);
    // postsList[0]._id = response.body[0]._id;
    postId = response.body[0]._id;
  });

  //get post by id
  test("Get Post by ID", async () => {
    const response = await request(app).get("/post/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.text).toBe(postsList[0].text);
    expect(response.body.img).toBe(postsList[0].img);
    expect(response.body._id).toBe(postId);
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
  });

  test("Update Post", async () => {
    postsList[0].text = "Inception Updated";
    postsList[0].img = "inception_updated.jpg";
    const response = await request(app)
      .put("/post/" + postId)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(postsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.text).toBe(postsList[0].text);
    expect(response.body.img).toBe(postsList[0].img);
    expect(response.body._id).toBe(postId);
  });

  test("Delete Post", async () => {
    const response = await request(app)
      .delete("/post/" + postId)
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body._id).toBe(postId);

    const getResponse = await request(app).get("/post/" + postId);
    expect(getResponse.status).toBe(404);
  });
});
