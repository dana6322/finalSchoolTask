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
    <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
      {/* Header: user info + delete */}
      <div className="card-body pb-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Link to={`/user/${senderId}`}>
              {sender?.profilePicture ? (
                <img
                  src={sender.profilePicture}
                  alt={sender.userName}
                  className="rounded-circle"
                  style={{ width: "42px", height: "42px", objectFit: "cover", border: "2px solid #e9ecef" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                  style={{ width: "42px", height: "42px" }}
                >
                  <span className="text-white fw-bold">
                    {(sender?.userName || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            <div>
              <Link
                to={`/user/${senderId}`}
                className="text-decoration-none text-dark fw-semibold"
                style={{ fontSize: "0.95rem" }}
              >
                {sender?.userName || "User"}
              </Link>
              <div>
                <small className="text-muted">
                  {new Date(post.createdAt || "").toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
          {canDelete && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          )}
        </div>
      </div>

      {/* Post text */}
      {post.text && (
        <div className="px-3 pb-2">
          <p className="card-text mb-0">{post.text}</p>
        </div>
      )}

      {/* Post image — full width, natural aspect ratio */}
      {!imageError && post.img && (
        <div style={{ backgroundColor: "#f8f9fa" }}>
          <img
            src={post.img}
            alt="Post"
            className="w-100"
            style={{ maxHeight: "600px", objectFit: "contain" }}
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Footer */}
      <div className="card-body pt-2">
        <Link to={`/post/${post._id}`} className="btn btn-sm btn-outline-primary">
          💬 View Comments
        </Link>
      </div>
    </div>
  );
}
