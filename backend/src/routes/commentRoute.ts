import express from "express";
import commentController from "../controllers/commentController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /comment:
 *   get:
 *     tags: [Comments]
 *     summary: Get all comments
 *     description: Retrieve a list of all comments in the database
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Filter comments by post ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentWithPopulatedSender'
 *             example:
 *               - _id: "507f1f77bcf86cd799439013"
 *                 message: "Great post!"
 *                 postId: "507f1f77bcf86cd799439011"
 *                 sender:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   userName: "johndoe"
 *                   profilePicture: "https://example.com/johndoe.jpg"
 *               - _id: "507f1f77bcf86cd799439014"
 *                 message: "Amazing content"
 *                 postId: "507f1f77bcf86cd799439011"
 *                 sender:
 *                   _id: "507f1f77bcf86cd799439015"
 *                   userName: "janedoe"
 *                   profilePicture: "https://example.com/janedoe.jpg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Comments]
 *     summary: Create a new comment
 *     description: Create a new comment on a post (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - postId
 *             properties:
 *               message:
 *                 type: string
 *                 description: Comment message
 *                 example: "This is an amazing post!"
 *               postId:
 *                 type: string
 *                 description: ID of the post being commented on
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Message and postId are required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       404:
 *         description: Referenced post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Post not found"
 */
router.get("/", commentController.getAll.bind(commentController));

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags: [Comments]
 *     summary: Get comment by ID
 *     description: Retrieve a specific comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentWithPopulatedSender'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 *       400:
 *         description: Invalid comment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid comment ID"
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Delete a comment by ID (requires authentication and ownership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       403:
 *         description: Forbidden - Not the comment creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You can only delete comments you created"
 *       400:
 *         description: Invalid comment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid comment ID"
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Update a comment by ID (requires authentication and ownership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Updated comment message
 *                 example: "Updated: This is an even better post!"
 *               postId:
 *                 type: string
 *                 description: ID of the post being commented on
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       403:
 *         description: Forbidden - Not the comment creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You can only update comments you created"
 *       400:
 *         description: Invalid input data or comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid comment ID or data"
 */
router.get("/:id", commentController.getById.bind(commentController));

/**
 * @swagger
 * /comment:
 *   post:
 *     tags: [Comments]
 *     summary: Create a new comment
 *     description: Create a new comment on a post (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - postId
 *             properties:
 *               message:
 *                 type: string
 *                 description: Comment message
 *                 example: "This is an amazing post!"
 *               postId:
 *                 type: string
 *                 description: ID of the post being commented on
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Message and postId are required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       404:
 *         description: Referenced post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Post not found"
 */
router.post(
  "/",
  authenticate,
  commentController.create.bind(commentController),
);

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Delete a comment by ID (requires authentication and ownership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       403:
 *         description: Forbidden - Not the comment creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You can only delete comments you created"
 *       400:
 *         description: Invalid comment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid comment ID"
 */
router.delete(
  "/:id",
  authenticate,
  commentController.del.bind(commentController),
);

/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Update a comment by ID (requires authentication and ownership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Updated comment message
 *                 example: "Updated: This is an even better post!"
 *               postId:
 *                 type: string
 *                 description: ID of the post being commented on
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access token required"
 *       403:
 *         description: Forbidden - Not the comment creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You can only update comments you created"
 *       400:
 *         description: Invalid input data or comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid comment ID or data"
 */
router.put(
  "/:id",
  authenticate,
  commentController.update.bind(commentController),
);

export default router;
