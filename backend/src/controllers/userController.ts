import userModel from "../models/userModel";
import { Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class UsersController extends baseController {
  constructor() {
    super(userModel);
  }

  // Override create method to associate user with authenticated user
  async create(req: AuthRequest, res: Response) {
    if (req.user) {
      req.body._id = req.user._id; // Associate user with user ID from token
    }
    return super.create(req, res);
  }

  //OVERRIDE DELETE to ensure only creator can delete
  async del(req: AuthRequest, res: Response): Promise<Response | undefined> {
    const id = req.params.id;
    try {
      const user = await this.model.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check if the authenticated user is the creator of the user
      const authReq = req as AuthRequest;
      if (authReq.user && user._id.toString() === authReq.user._id) {
        return await super.del(req, res);
      } else {
        return res.status(403).json({
          message: "Forbidden: You are not the creator of this user",
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting user" });
    }
  }

  //override put to prevent changing _id
  async update(req: AuthRequest, res: Response): Promise<Response | undefined> {
    const id = req.params.id;
    try {
      const user = await this.model.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Prevent changing _id field
      if (req.body._id && req.body._id !== user._id.toString()) {
        return res.status(400).json({ message: "Cannot change user ID" });
      }
      // Prevent changing password and email via update endpoint
      if (req.body.password || req.body.email) {
        return res.status(400).json({
          message:
            "Cannot change password or email via this endpoint. Use /auth/changePassword for password changes.",
        });
      }
      // Delegate to base controller and return its result
      return await super.update(req, res);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating user" });
    }
  }

  // Get current authenticated user's profile
  async getCurrentUser(
    req: AuthRequest,
    res: Response,
  ): Promise<Response | undefined> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await this.model.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password and refreshTokens
      const userResponse = {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(200).json(userResponse);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving user" });
    }
  }
}

export default new UsersController();
