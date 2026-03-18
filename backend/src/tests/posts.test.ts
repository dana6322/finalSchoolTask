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
    expect(response.body.posts).toEqual([]);
    expect(response.body.page).toBe(1);
    expect(response.body.total).toBe(0);
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
      expect(response.body.likes).toBeDefined();
      expect(response.body.likes).toEqual([]);
      expect(response.body.commentsCount).toBe(0);
    }
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(postsList.length);
    expect(response.body.total).toBe(postsList.length);
    expect(response.body.page).toBe(1);
    expect(response.body.pages).toBe(1);
    // Each post should have commentsCount
    for (const post of response.body.posts) {
      expect(post).toHaveProperty("commentsCount");
      expect(post.commentsCount).toBe(0);
    }
  });

  test("Get Posts by sender", async () => {
    const response = await request(app).get("/post?sender=" + loginUser._id);
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(postsList.length);
    expect(response.body.total).toBe(postsList.length);
    postId = response.body.posts[0]._id;
  });

  //get post by id
  test("Get Post by ID", async () => {
    const response = await request(app).get("/post/" + postId);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postId);
    expect(response.body).toHaveProperty("text");
    expect(response.body).toHaveProperty("img");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
    expect(response.body).toHaveProperty("commentsCount");
    expect(response.body.commentsCount).toBe(0);
  });

  test("Update Post", async () => {
    const updatedText = "Updated Post Text";
    const updatedImg = "updated.jpg";
    const response = await request(app)
      .put("/post/" + postId)
      .set("Authorization", "Bearer " + loginUser.token)
      .send({ text: updatedText, img: updatedImg });
    expect(response.status).toBe(200);
    expect(response.body.text).toBe(updatedText);
    expect(response.body.img).toBe(updatedImg);
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

describe("Pagination Tests", () => {
  beforeAll(async () => {
    await postModel.deleteMany();
    // Create 5 posts for pagination testing
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + loginUser.token)
        .send({ text: `Pagination Post ${i}`, img: `img${i}.jpg` });
    }
  });

  test("Default pagination returns first page", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.total).toBe(5);
    expect(response.body.pages).toBe(1);
    expect(response.body.posts.length).toBe(5);
  });

  test("Custom page size limits results", async () => {
    const response = await request(app).get("/post?limit=2");
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(2);
    expect(response.body.total).toBe(5);
    expect(response.body.pages).toBe(3);
    expect(response.body.page).toBe(1);
  });

  test("Second page returns correct posts", async () => {
    const response = await request(app).get("/post?page=2&limit=2");
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(2);
    expect(response.body.page).toBe(2);
    expect(response.body.total).toBe(5);
  });

  test("Last page returns remaining posts", async () => {
    const response = await request(app).get("/post?page=3&limit=2");
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(1);
    expect(response.body.page).toBe(3);
  });

  test("Page beyond total returns empty posts array", async () => {
    const response = await request(app).get("/post?page=10&limit=2");
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(0);
    expect(response.body.page).toBe(10);
    expect(response.body.total).toBe(5);
  });

  test("Posts are sorted by newest first", async () => {
    const response = await request(app).get("/post?limit=5");
    expect(response.status).toBe(200);
    const posts = response.body.posts;
    for (let i = 0; i < posts.length - 1; i++) {
      const dateA = new Date(posts[i].createdAt).getTime();
      const dateB = new Date(posts[i + 1].createdAt).getTime();
      expect(dateA).toBeGreaterThanOrEqual(dateB);
    }
  });

  test("Pagination works with sender filter", async () => {
    const response = await request(app).get(
      "/post?sender=" + loginUser._id + "&limit=2&page=1",
    );
    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(2);
    expect(response.body.total).toBe(5);
  });
});
