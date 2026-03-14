import request from "supertest";
import { Express } from "express";

export type UserData = {
  email: string;
  password: string;
  userName: string;
  _id: string;
  token: string;
  refreshToken: string;
};

export const userData = {
  email: "test@test.com",
  password: "testpass",
  userName: "testuser",
  _id: "",
  token: "",
  refreshToken: "",
};

export const getLogedInUser = async (app: Express): Promise<UserData> => {
  // Create a unique email for each test to avoid conflicts when running tests together
  const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@test.com`;
  const testUser = {
    email: uniqueEmail,
    password: "testpass",
    userName: `testuser-${Date.now()}`,
  };

  let response = await request(app)
    .post("/auth/register")
    .send(testUser);
  
  // If registration fails, try to login with the unique credentials
  if (response.status !== 201) {
    response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });
  }
  
  const logedUser = {
    _id: response.body._id,
    token: response.body.token,
    refreshToken: response.body.refreshToken,
    email: testUser.email,
    password: testUser.password,
    userName: testUser.userName,
  };
  return logedUser;
};

export type PostData = {
  text: string;
  img: string;
  sender?: string;
  _id?: string;
};

export const postsList: PostData[] = [
  {
    text: "Inception",
    img: "https://sustainablebusinessmagazine.net/wp-content/uploads/2025/08/sea.jpg",
  },
  {
    text: "The Matrix",
    img: "https://sustainablebusinessmagazine.net/wp-content/uploads/2025/08/sea.jpg",
  },
  {
    text: "Interstellar",
    img: "https://sustainablebusinessmagazine.net/wp-content/uploads/2025/08/sea.jpg",
  },
];
