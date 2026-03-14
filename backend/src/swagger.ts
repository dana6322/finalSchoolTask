import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Posts, Comments & Users API",
      version: "1.0.0",
      description:
        "A RESTful API for managing posts, comments, and users with user authentication",
      contact: {
        name: "Dana Uzlaner",
        email: "developer@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token",
        },
      },
      schemas: {
        Post: {
          type: "object",
          required: ["text", "img"],
          properties: {
            _id: {
              type: "string",
              description: "Post ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439011",
            },
            text: {
              type: "string",
              description: "Post text content",
              example: "Check out this amazing photo!",
            },
            img: {
              type: "string",
              description: "Post image URL",
              example: "https://example.com/image.jpg",
            },
            sender: {
              type: "string",
              description: "ID of the user who created the post",
              example: "507f1f77bcf86cd799439012",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Post creation timestamp",
              example: "2026-01-31T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Post last update timestamp",
              example: "2026-01-31T11:00:00.000Z",
            },
          },
        },
        User: {
          type: "object",
          required: ["email", "password", "userName"],
          properties: {
            _id: {
              type: "string",
              description: "User ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439012",
            },
            userName: {
              type: "string",
              description: "User username",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "User password (hashed)",
              example: "password123",
            },
            firstName: {
              type: "string",
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name",
              example: "Doe",
            },
            bio: {
              type: "string",
              description: "User's biography/description",
              example: "I love coding and photography",
            },
            profilePicture: {
              type: "string",
              description: "URL to user's profile picture",
              example: "https://example.com/profile.jpg",
            },
            refreshTokens: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of refresh tokens",
              example: ["token1", "token2"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User account creation timestamp",
              example: "2026-01-31T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User profile last update timestamp",
              example: "2026-01-31T11:00:00.000Z",
            },
          },
        },
        Comment: {
          type: "object",
          required: ["message", "postId"],
          properties: {
            _id: {
              type: "string",
              description: "Comment ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439013",
            },
            message: {
              type: "string",
              description: "Comment message content",
              example: "Great post!",
            },
            postId: {
              type: "string",
              description: "ID of the post being commented on",
              example: "507f1f77bcf86cd799439011",
            },
            sender: {
              type: "string",
              description: "ID of the user who wrote the comment",
              example: "507f1f77bcf86cd799439012",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation timestamp",
              example: "2026-01-31T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Comment last update timestamp",
              example: "2026-01-31T11:00:00.000Z",
            },
          },
        },
        PostWithPopulatedSender: {
          type: "object",
          required: ["text", "img"],
          properties: {
            _id: {
              type: "string",
              description: "Post ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439011",
            },
            text: {
              type: "string",
              description: "Post text content",
              example: "Check out this amazing photo!",
            },
            img: {
              type: "string",
              description: "Post image URL",
              example: "https://example.com/image.jpg",
            },
            sender: {
              type: "object",
              description: "User object with limited fields (ID, username, and profile picture)",
              properties: {
                _id: {
                  type: "string",
                  description: "User ID",
                  example: "507f1f77bcf86cd799439012",
                },
                userName: {
                  type: "string",
                  description: "User's username",
                  example: "johndoe",
                },
                profilePicture: {
                  type: "string",
                  description: "URL to user's profile picture",
                  example: "https://example.com/profile.jpg",
                },
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Post creation timestamp",
              example: "2026-01-31T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Post last update timestamp",
              example: "2026-01-31T11:00:00.000Z",
            },
          },
        },
        CommentWithPopulatedSender: {
          type: "object",
          required: ["message", "postId"],
          properties: {
            _id: {
              type: "string",
              description: "Comment ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439013",
            },
            message: {
              type: "string",
              description: "Comment message content",
              example: "Great post!",
            },
            postId: {
              type: "string",
              description: "ID of the post being commented on",
              example: "507f1f77bcf86cd799439011",
            },
            sender: {
              type: "object",
              description: "User object with limited fields (ID, username, and profile picture)",
              properties: {
                _id: {
                  type: "string",
                  description: "User ID",
                  example: "507f1f77bcf86cd799439012",
                },
                userName: {
                  type: "string",
                  description: "User's username",
                  example: "johndoe",
                },
                profilePicture: {
                  type: "string",
                  description: "URL to user's profile picture",
                  example: "https://example.com/profile.jpg",
                },
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation timestamp",
              example: "2026-01-31T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Comment last update timestamp",
              example: "2026-01-31T11:00:00.000Z",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "User password",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "userName"],
          properties: {
            userName: {
              type: "string",
              description: "User username",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password (minimum 6 characters)",
              example: "password123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
              description: "User's current password",
              example: "oldPassword123",
            },
            newPassword: {
              type: "string",
              minLength: 6,
              description: "User's new password (minimum 6 characters)",
              example: "newPassword123",
            },
          },
        },
        LogoutRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "JWT refresh token to invalidate",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "An error occurred",
            },
            status: {
              type: "number",
              description: "HTTP status code",
              example: 400,
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Posts",
        description: "Post management endpoints",
      },
      {
        name: "Comments",
        description: "Comment management endpoints",
      },
    ],
  },
  apis: [],
};

// Manually define paths
const manualPaths = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description: "Create a new user account with email and password",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        400: { description: "Invalid input data" },
        409: { description: "User already exists" },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login user",
      description: "Authenticate user and return JWT tokens",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        401: { description: "Invalid credentials" },
      },
    },
  },
  "/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh access token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        401: { description: "Invalid refresh token" },
      },
    },
  },
  "/user": {
    get: {
      tags: ["Users"],
      summary: "Get all users",
      responses: {
        200: {
          description: "List of users",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
  },
  "/user/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "User details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        404: { description: "User not found" },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update a user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User updated successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Cannot update other users" },
        404: { description: "User not found" },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete a user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "User deleted successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Cannot delete other users" },
        404: { description: "User not found" },
      },
    },
  },
  "/post": {
    get: {
      tags: ["Posts"],
      summary: "Get all posts",
      responses: {
        200: {
          description: "List of posts",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/PostWithPopulatedSender" },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Posts"],
      summary: "Create a new post",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["text", "img"],
              properties: {
                text: { type: "string" },
                img: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Post created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Post" },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/post/{id}": {
    get: {
      tags: ["Posts"],
      summary: "Get post by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Post details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostWithPopulatedSender" },
            },
          },
        },
        404: { description: "Post not found" },
      },
    },
    put: {
      tags: ["Posts"],
      summary: "Update a post",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                text: { type: "string" },
                img: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Post updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Post" },
            },
          },
        },
        400: { description: "Invalid input data or cannot change creator" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the post creator" },
        404: { description: "Post not found" },
      },
    },
    delete: {
      tags: ["Posts"],
      summary: "Delete a post",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Post deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Post" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the post creator" },
        404: { description: "Post not found" },
      },
    },
  },
  "/comment": {
    get: {
      tags: ["Comments"],
      summary: "Get all comments",
      parameters: [
        {
          name: "postId",
          in: "query",
          schema: { type: "string" },
          description: "Filter by post ID",
        },
      ],
      responses: {
        200: {
          description: "List of comments",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/CommentWithPopulatedSender" },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Comments"],
      summary: "Create a new comment",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["message", "postId"],
              properties: {
                message: { type: "string" },
                postId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Comment created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Comment" },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/comment/{id}": {
    get: {
      tags: ["Comments"],
      summary: "Get comment by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Comment details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentWithPopulatedSender" },
            },
          },
        },
        404: { description: "Comment not found" },
      },
    },
    put: {
      tags: ["Comments"],
      summary: "Update a comment",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                postId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Comment updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Comment" },
            },
          },
        },
        400: { description: "Invalid input data" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the comment creator" },
        404: { description: "Comment not found" },
      },
    },
    delete: {
      tags: ["Comments"],
      summary: "Delete a comment",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Comment deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Comment" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the comment creator" },
        404: { description: "Comment not found" },
      },
    },
  },
};

// Add manual paths to the options definition
const completeOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: options.definition!.info!,
    servers: options.definition!.servers,
    components: options.definition!.components,
    tags: options.definition!.tags,
    paths: manualPaths,
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(completeOptions);

export { swaggerUi, swaggerSpec };
