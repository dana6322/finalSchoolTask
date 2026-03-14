import { type Post, type User } from "../types";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostDeleted: () => void;
}

export default function PostCard({
  post,
  currentUserId,
  onPostDeleted,
}: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if sender is an object (populated) or string (ID only)
  const sender = post.sender ? (post.sender as User) : null;
  const senderId =
    typeof post.sender === "string" ? post.sender : sender?._id || null;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      try {
        await api.delete(`/post/${post._id}`);
        onPostDeleted();
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const canDelete = senderId === currentUserId;

  return (
    <div className="card mb-3 shadow-sm">
      {!imageError && post.img && (
        <img
          src={post.img}
          alt="Post"
          className="card-img-top"
          style={{ height: "300px", objectFit: "cover" }}
          onError={() => setImageError(true)}
        />
      )}
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            {sender?.profilePicture && (
              <img
                src={sender.profilePicture}
                alt={sender.userName}
                className="rounded-circle"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              <h6 className="card-subtitle mb-0">
                {sender?.userName || "User"}
              </h6>
              <small className="text-muted">
                {new Date(post.createdAt || "").toLocaleDateString()}
              </small>
            </div>
          </div>
          {canDelete && (
            <button
              className="btn btn-sm btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
        <p className="card-text">{post.text}</p>
        <Link to={`/post/${post._id}`} className="btn btn-sm btn-primary">
          View Comments
        </Link>
      </div>
    </div>
  );
}
