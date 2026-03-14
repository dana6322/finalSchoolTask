import request from "supertest";
import initApp from "../index";
import postModel from "../models/postModel";
import { Express } from "express";
import { getLogedInUser, UserData, postsList } from "./utils";

let app: Express;
let loginUser: UserData;
let secondUser: UserData;
let postId = "";

beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany();
  loginUser = await getLogedInUser(app);
  secondUser = await getLogedInUser(app);

  // Create a post to use for like tests
  const response = await request(app)
    .post("/post")
    .set("Authorization", "Bearer " + loginUser.token)
    .send(postsList[0]);
  postId = response.body._id;
});

afterAll((done) => {
  done();
});

describe("Likes Test Suite", () => {
  test("Post should initially have empty likes array", async () => {
    const response = await request(app).get("/post/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.likes).toBeDefined();
    expect(response.body.likes).toEqual([]);
  });

  test("Like a post", async () => {
    const response = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    expect(response.body.likes).toHaveLength(1);
    expect(response.body.likes).toContain(loginUser._id);
  });

  test("Unlike a post (toggle off)", async () => {
    const response = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    expect(response.body.likes).toHaveLength(0);
    expect(response.body.likes).not.toContain(loginUser._id);
  });

  test("Multiple users can like a post", async () => {
    // First user likes
    const res1 = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
    expect(res1.status).toBe(200);
    expect(res1.body.likes).toHaveLength(1);

    // Second user likes
    const res2 = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + secondUser.token);
    expect(res2.status).toBe(200);
    expect(res2.body.likes).toHaveLength(2);
    expect(res2.body.likes).toContain(loginUser._id);
    expect(res2.body.likes).toContain(secondUser._id);
  });

  test("One user unliking does not affect other user's like", async () => {
    // First user unlikes
    const res = await request(app)
      .post("/post/" + postId + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
    expect(res.status).toBe(200);
    expect(res.body.likes).toHaveLength(1);
    expect(res.body.likes).not.toContain(loginUser._id);
    expect(res.body.likes).toContain(secondUser._id);
  });

  test("Like a non-existent post returns 404", async () => {
    const fakeId = "507f1f77bcf86cd799439099";
    const response = await request(app)
      .post("/post/" + fakeId + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(404);
  });

  test("Like without auth returns 401", async () => {
    const response = await request(app)
      .post("/post/" + postId + "/like");
    expect(response.status).toBe(401);
  });

  test("Likes persist when fetching all posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    const likedPost = response.body.find((p: any) => p._id === postId);
    expect(likedPost).toBeDefined();
    expect(likedPost.likes).toBeDefined();
    expect(Array.isArray(likedPost.likes)).toBe(true);
  });
});
