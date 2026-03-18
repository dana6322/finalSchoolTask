import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";
import { smartSearch } from "../services/geminiService";

// Simple per-user cooldown to avoid hitting Gemini rate limits
const lastSearchTime = new Map<string, number>();
const COOLDOWN_MS = 15_000; // 15 seconds between searches per user

class AIController {
  /**
   * POST /ai/search
   * Body: { query: string }
   * Performs a smart, AI-powered search across all posts and comments.
   */
  async search(req: AuthRequest, res: Response) {
    const { query } = req.body;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const userId = req.user?._id?.toString() || "anonymous";
    const now = Date.now();
    const lastTime = lastSearchTime.get(userId) || 0;
    if (now - lastTime < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSec} seconds before searching again.`,
      });
    }
    lastSearchTime.set(userId, now);

    try {
      // Fetch all posts and comments with populated senders
      const [posts, comments] = await Promise.all([
        postModel.find().populate("sender", "userName _id").lean(),
        commentModel.find().populate("sender", "userName _id").lean(),
      ]);

      const result = await smartSearch(
        query.trim(),
        posts as any,
        comments as any,
      );

      // Fetch the full relevant posts to return alongside the AI answer
      const relevantPosts =
        result.relevantPostIds.length > 0
          ? await postModel
              .find({ _id: { $in: result.relevantPostIds } })
              .populate("sender", "userName profilePicture _id")
              .lean()
          : [];

      return res.json({
        answer: result.answer,
        relevantPosts,
      });
    } catch (error: any) {
      console.error("AI search error:", error);
      if (error?.status === 429) {
        return res
          .status(429)
          .json({ message: "AI rate limit reached. Please wait a minute and try again." });
      }
      return res
        .status(500)
        .json({ message: "AI search failed. Please try again later." });
    }
  }
}

export default new AIController();
