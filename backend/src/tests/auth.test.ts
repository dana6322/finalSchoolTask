import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import User from "../models/userModel";
import { userData, postsList } from "./utils";
let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany();
});

afterAll((done) => {
  done();
});

describe("Test Auth Suite", () => {
  test("Test post a post without token fails", async () => {
    const postData = postsList[0];
    const response = await request(app).post("/post").send(postData);
    expect(response.status).toBe(401);
  });

  test("Test Registration", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ email: userData.email, password: userData.password });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    userData.token = response.body.token;
    //check refresh token
    expect(response.body).toHaveProperty("refreshToken");
    userData.refreshToken = response.body.refreshToken;
    userData._id = response.body._id;
  });

  test("create a post with token succeeds", async () => {
    const postData = postsList[0];
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .send(postData);
    expect(response.status).toBe(201);
  });

  test("create a post with compromised token fails", async () => {
    const postData = postsList[0];
    const compromizedToken = userData.token + "a";
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + compromizedToken)
      .send(postData);
    expect(response.status).toBe(401);
  });

  test("Test Login", async () => {
    const email = userData.email;
    const password = userData.password;
    const response = await request(app)
      .post("/auth/login")
      .send({ email: email, password: password });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  jest.setTimeout(10000);

  test("Test using token after expiration fails", async () => {
    //sleep for 5 seconds to let the token expire
    await new Promise((r) => setTimeout(r, 5000));
    const postData = postsList[0];
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .send(postData);
    expect(response.status).toBe(401);

    //refresh the token
    const refreshResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });
    console.log("Refresh response body:", refreshResponse.body);
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty("token");
    userData.token = refreshResponse.body.token;
    userData.refreshToken = refreshResponse.body.refreshToken;

    //try to create post again
    const retryResponse = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .send(postData);
    expect(retryResponse.status).toBe(201);
  });

  //test double use of refresh token fails
  test("Test double use of refresh token fails", async () => {
    //use the current refresh token to get a new token
    const refreshResponse1 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });
    expect(refreshResponse1.status).toBe(200);
    expect(refreshResponse1.body).toHaveProperty("token");
    const newRefreshToken = refreshResponse1.body.refreshToken;

    //try to use the same refresh token again
    const refreshResponse2 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });
    expect(refreshResponse2.status).toBe(401);

    //try to use the new refresh token also fails
    const refreshResponse3 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: newRefreshToken });
    expect(refreshResponse3.status).toBe(401);
  });

  test("Test logout without refresh token fails", async () => {
    const response = await request(app).post("/auth/logout").send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Refresh token is required");
  });

  test("Test logout with invalid refresh token fails", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "invalidToken" });
    expect(response.status).toBe(401);
  });

  test("Test logout succeeds", async () => {
    // Register a new user for logout test with unique email and username
    const uniqueEmail = `logouttest${Date.now()}@example.com`;
    const uniqueUsername = `logoutuser${Date.now()}`;
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: "password123",
        userName: uniqueUsername,
      });
    expect(registerResponse.status).toBe(201);
    const logoutRefreshToken = registerResponse.body.refreshToken;

    // Perform logout
    const logoutResponse = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: logoutRefreshToken });
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.message).toBe(
      "User successfully logged out"
    );

    // Try to use the refresh token after logout - should fail
    const refreshAfterLogout = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: logoutRefreshToken });
    expect(refreshAfterLogout.status).toBe(401);
  });

  test("Test changePassword without token fails", async () => {
    const response = await request(app)
      .post("/auth/changePassword")
      .send({
        currentPassword: "password123",
        newPassword: "newPassword123",
      });
    expect(response.status).toBe(401);
  });

  test("Test changePassword with incorrect current password fails", async () => {
    const uniqueEmail = `changepass${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: "correctPassword123",
        userName: `changepassuser${Date.now()}`,
      });
    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token;

    const response = await request(app)
      .post("/auth/changePassword")
      .set("Authorization", "Bearer " + token)
      .send({
        currentPassword: "wrongPassword123",
        newPassword: "newPassword123",
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Current password is incorrect");
  });

  test("Test changePassword with same password fails", async () => {
    const uniqueEmail = `samepass${Date.now()}@example.com`;
    const password = "password123";
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: password,
        userName: `samepassuser${Date.now()}`,
      });
    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token;

    const response = await request(app)
      .post("/auth/changePassword")
      .set("Authorization", "Bearer " + token)
      .send({
        currentPassword: password,
        newPassword: password,
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "New password must be different from current password"
    );
  });

  test("Test changePassword succeeds", async () => {
    const uniqueEmail = `changepasssuccess${Date.now()}@example.com`;
    const oldPassword = "oldPassword123";
    const newPassword = "newPassword456";
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: oldPassword,
        userName: `changepasssuccessuser${Date.now()}`,
      });
    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token;

    // Change password
    const changeResponse = await request(app)
      .post("/auth/changePassword")
      .set("Authorization", "Bearer " + token)
      .send({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });
    expect(changeResponse.status).toBe(200);
    expect(changeResponse.body.message).toBe("Password changed successfully");

    // Try to login with old password - should fail
    const loginOldResponse = await request(app)
      .post("/auth/login")
      .send({ email: uniqueEmail, password: oldPassword });
    expect(loginOldResponse.status).toBe(401);

    // Try to login with new password - should succeed
    const loginNewResponse = await request(app)
      .post("/auth/login")
      .send({ email: uniqueEmail, password: newPassword });
    expect(loginNewResponse.status).toBe(200);
    expect(loginNewResponse.body).toHaveProperty("token");
  });
});
