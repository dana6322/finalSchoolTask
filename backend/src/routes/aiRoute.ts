import express from "express";
import aiController from "../controllers/aiController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /ai/search:
 *   post:
 *     tags: [AI]
 *     summary: Smart search across posts and comments
 *     description: Uses Gemini AI to perform intelligent free-text search across all posts and comments. Returns a summary answer and relevant posts.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The free-text search query
 *                 example: "What are people saying about technology?"
 *     responses:
 *       200:
 *         description: AI search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: AI-generated summary answering the query
 *                 relevantPosts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PostWithPopulatedSender'
 *       400:
 *         description: Missing search query
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI search failed
 */
router.post("/search", authenticate, (req, res) => {
  aiController.search(req, res);
});

export default router;
