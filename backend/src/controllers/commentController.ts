import commentsModel from "../models/commentModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class CommentsController extends baseController {
  constructor() {
    super(commentsModel);
  }

  // Override getAll to populate sender with username and id
  async getAll(req: AuthRequest, res: Response) {
    try {
      let query = this.model
        .find(req.query || {})
        .populate("sender", "userName profilePicture _id");
      const data = await query;
      return res.json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving data" });
    }
  }

  // Override getById to populate sender with username and id
  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id;
    try {
      const item = await this.model
        .findById(id)
        .populate("sender", "userName profilePicture _id");
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving item" });
    }
  }

  // Override create method to associate comment with authenticated user
  async create(req: AuthRequest, res: Response) {
    if (req.user) {
      req.body.sender = req.user._id; // Associate comment with user ID from token
    }
    const itemData = req.body;
    try {
      const newData = await this.model.create(itemData);
      // Populate sender before returning
      const populatedData = await this.model
        .findById(newData._id)
        .populate("sender", "userName profilePicture _id");
      res.status(201).json(populatedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating item" });
    }
  }

  // Override DELETE to ensure only creator can delete
  async del(req: Request, res: Response): Promise<Response | undefined> {
    const authReq = req as AuthRequest;
    const id = req.params.id;
    try {
      const comment = await this.model.findById(id);
      if (!comment) {
        return res.status(404).send("Comment not found");
      }
      // Check if the authenticated user is the creator of the comment
      if (authReq.user && comment.sender.toString() === authReq.user._id) {
        return super.del(req, res);
      } else {
        return res
          .status(403)
          .send("Forbidden: You are not the creator of this comment");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error deleting comment");
    }
  }

  // Override update to prevent changing userId and ensure ownership
  async update(req: Request, res: Response): Promise<Response | undefined> {
    const id = req.params.id;
    try {
      const authReq = req as AuthRequest;
      const comment = await this.model.findById(id);
      if (!comment) {
        return res.status(404).send("Comment not found");
      }
      // Check if the authenticated user is the creator of the comment
      if (!authReq.user || comment.sender.toString() !== authReq.user._id) {
        return res
          .status(403)
          .send("Forbidden: You are not the creator of this comment");
      }
      // Prevent changing userId field
      if (
        authReq.body.sender &&
        authReq.body.sender !== comment.sender.toString()
      ) {
        return res.status(400).send("Cannot change creator of the comment");
      }
      return super.update(req, res);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error updating comment");
    }
  }
}

export default new CommentsController();
