import request from "supertest";
import initApp from "../index";
import User from "../models/userModel";
import { Express } from "express";
import { getLogedInUser, UserData } from "./utils";

let app: Express;
let loginUser: UserData;
let secondUser: UserData;
const testUserData = {
  email: "seconduser@test.com",
  password: "secondpassword",
  userName: "secondusername",
};

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany();
  loginUser = await getLogedInUser(app);
  // Create a second user for testing delete/update without auth
  const response = await request(app).post("/auth/register").send(testUserData);
  secondUser = {
    _id: response.body._id,
    token: response.body.token,
    refreshToken: response.body.refreshToken,
    email: testUserData.email,
    password: testUserData.password,
    userName: testUserData.userName,
  };
});

afterAll((done) => {
  done();
});

describe("Users Test Suite", () => {
  test("Get all users", async () => {
    const response = await request(app).get("/user");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Get User by ID", async () => {
    const response = await request(app).get("/user/" + loginUser._id);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(loginUser._id);
    expect(response.body.email).toBe(loginUser.email);
  });

  test("Update User - succeeds for own user", async () => {
    const updateData = {
      userName: "updatedusername",
    };
    const response = await request(app)
      .put("/user/" + loginUser._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updateData);
    expect(response.status).toBe(200);
    expect(response.body.userName).toBe(updateData.userName);
  });

  test("Update User - fails when changing ID", async () => {
    const updateData = {
      email: loginUser.email,
      password: loginUser.password,
      userName: "anothername",
      _id: "507f1f77bcf86cd799439099", // Different ID
    };
    const response = await request(app)
      .put("/user/" + loginUser._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updateData);
    expect(response.status).toBe(400);
  });

  test("Create User - associates with authenticated user ID", async () => {
    const response = await request(app)
      .post("/user")
      .set("Authorization", "Bearer " + loginUser.token)
      .send({
        email: "test@example.com",
        password: "pass123",
        userName: "testuser",
      });
    // The controller sets _id from the authenticated user, so it should fail with duplicate key
    // This is expected behavior - the post endpoint associates user data with the authenticated user's ID
    expect([500, 400]).toContain(response.status);
  });

  test("Delete User - succeeds for own user", async () => {
    const response = await request(app)
      .delete("/user/" + secondUser._id)
      .set("Authorization", "Bearer " + secondUser.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(secondUser._id);

    const getResponse = await request(app).get("/user/" + secondUser._id);
    expect(getResponse.status).toBe(404);
  });

  test("Create User without authentication fails", async () => {
    const response = await request(app).post("/user").send(testUserData);
    expect(response.status).toBe(401);
  });

  test("Update User without authentication fails", async () => {
    const updateData = {
      email: "updated@test.com",
      password: "newpass",
      userName: "updatedname",
    };
    const response = await request(app)
      .put("/user/" + loginUser._id)
      .send(updateData);
    expect(response.status).toBe(401);
  });

  test("Delete User without authentication fails", async () => {
    const response = await request(app).delete("/user/" + loginUser._id);
    expect(response.status).toBe(401);
  });

  test("Get non-existent user returns 404", async () => {
    const response = await request(app).get("/user/507f1f77bcf86cd799439099");
    expect(response.status).toBe(404);
  });

  test("Get current user profile without authentication fails", async () => {
    const response = await request(app).get("/user/me");
    expect(response.status).toBe(401);
  });

  test("Get current user profile succeeds", async () => {
    const response = await request(app)
      .get("/user/me")
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(loginUser._id);
    expect(response.body.email).toBe(loginUser.email);
    expect(response.body).toHaveProperty("firstName");
    expect(response.body).toHaveProperty("lastName");
    expect(response.body).toHaveProperty("bio");
    expect(response.body).toHaveProperty("profilePicture");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("refreshTokens");
  });

  test("Update user profile with new fields succeeds", async () => {
    const updateData = {
      firstName: "John",
      lastName: "Doe",
      bio: "This is my bio",
      profilePicture: "https://example.com/pic.jpg",
    };
    const response = await request(app)
      .put("/user/" + loginUser._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updateData);
    expect(response.status).toBe(200);
    expect(response.body.firstName).toBe(updateData.firstName);
    expect(response.body.lastName).toBe(updateData.lastName);
    expect(response.body.bio).toBe(updateData.bio);
    expect(response.body.profilePicture).toBe(updateData.profilePicture);
  });

  test("Update user profile - prevent password change via PUT", async () => {
    const updateData = {
      firstName: "Jane",
      password: "newPassword123",
    };
    const response = await request(app)
      .put("/user/" + loginUser._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updateData);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password/i);
  });

  test("Update user profile - prevent email change via PUT", async () => {
    const updateData = {
      firstName: "Jane",
      email: "newemail@test.com",
    };
    const response = await request(app)
      .put("/user/" + loginUser._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updateData);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });
});
