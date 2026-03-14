import express from "express";
import postController from "../controllers/postController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /post:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts
 *     description: Retrieve a list of all posts in the database
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostWithPopulatedSender'
 *             example:
 *               - _id: "507f1f77bcf86cd799439011"
 *                 text: "This is my first post!"
 *                 img: "https://example.com/image.jpg"
 *                 sender:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   userName: "johndoe"
 *                   profilePicture: "https://example.com/johndoe.jpg"
 *               - _id: "507f1f77bcf86cd799439013"
 *                 text: "Another amazing post"
 *                 img: "https://example.com/image2.jpg"
 *                 sender:
 *                   _id: "507f1f77bcf86cd799439014"
 *                   userName: "janedoe"
 *                   profilePicture: "https://example.com/janedoe.jpg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     description: Create a new post (requires authentication). The sender is automatically set to the authenticated user's ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - img
 *             properties:
 *               text:
 *                 type: string
 *                 description: Post content
 *                 example: "This is my first post!"
 *               img:
 *                 type: string
 *                 description: Image URL for the post
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Text and image are required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", postController.getAll.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by ID
 *     description: Retrieve a specific post by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostWithPopulatedSender'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Post not found"
 *       400:
 *         description: Invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid post ID"
 */
router.get("/:id", postController.getById.bind(postController));

/**
 * @swagger
 * /post:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     description: Create a new post (requires authentication). The sender is automatically set to the authenticated user's ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - img
 *             properties:
 *               text:
 *                 type: string
 *                 description: Post content
 *                 example: "This is my first post!"
 *               img:
 *                 type: string
 *                 description: Image URL for the post
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Text and image are required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", authenticate, postController.create.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
 *     description: Delete a specific post (requires authentication and ownership). Only the creator can delete their post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       403:
 *         description: Forbidden - Not the post creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You can only delete posts you created"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Post not found"
 */
router.delete("/:id", authenticate, postController.del.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Update a post
 *     description: Update a specific post (requires authentication and ownership). Only the creator can update their post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Updated post content
 *                 example: "Updated post text"
 *               img:
 *                 type: string
 *                 description: Updated image URL
 *                 example: "https://example.com/updated-image.jpg"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input data (cannot change creator)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Cannot change post creator"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       403:
 *         description: Forbidden - Not the post creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You can only update posts you created"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Post not found"
 */
router.put("/:id", authenticate, postController.update.bind(postController));

export default router;
