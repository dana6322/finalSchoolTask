import postModel from "../models/postModel";
import { Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class PostsController extends baseController {
  constructor() {
    super(postModel);
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

  // Override create method to associate post with authenticated user
  async create(req: AuthRequest, res: Response) {
    if (req.user) {
      req.body.sender = req.user._id; // Associate post with user ID from token
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

  //OVERRIDE DELETE to ensure only creator can delete
  async del(req: AuthRequest, res: Response): Promise<Response | undefined> {
    const id = req.params.id;
    try {
      const post = await this.model.findById(id);
      if (!post) {
        return res.status(404).send("Post not found");
      }
      // Check if the authenticated user is the creator of the post
      const authReq = req as AuthRequest;
      if (authReq.user && post.sender.toString() === authReq.user._id) {
        return await super.del(req, res);
      } else {
        return res
          .status(403)
          .send("Forbidden: You are not the creator of this post");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error deleting post");
    }
  }

  //override put to prevent changing sender
  async update(req: AuthRequest, res: Response): Promise<Response | undefined> {
    const id = req.params.id;
    try {
      const post = await this.model.findById(id);
      if (!post) {
        return res.status(404).send("Post not found");
      }
      // Prevent changing sender field
      if (req.body.sender && req.body.sender !== post.sender.toString()) {
        return res.status(400).send("Cannot change creator of the post");
      }
      // Delegate to base controller and return its result
      return await super.update(req, res);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error updating post");
    }
  }
}

export default new PostsController();
