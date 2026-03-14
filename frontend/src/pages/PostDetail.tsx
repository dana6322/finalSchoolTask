import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Post, Comment, User } from "../types";
import api from "../services/api";
import CommentList from "../components/CommentList";
import AddCommentForm from "../components/AddCommentForm";

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [senderInfo, setSenderInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchPostDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/post/${postId}`),
        api.get(`/comment?postId=${postId}`),
      ]);

      setPost(postRes.data);
      setComments(commentsRes.data);

      // Fetch sender info if sender is just an ID
      if (typeof postRes.data.sender === "string") {
        try {
          const userRes = await api.get(`/user/${postRes.data.sender}`);
          setSenderInfo(userRes.data);
        } catch (err) {
          console.error("Failed to fetch sender info:", err);
        }
      }
      setError("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load post");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPostDetail();
  }, [postId, token, navigate, fetchPostDetail]);

  const handleCommentAdded = async () => {
    await fetchPostDetail();
  };

  const handleCommentDeleted = async () => {
    await fetchPostDetail();
  };

  if (isLoading) {
    return (
      <div className="feed-content text-center py-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "var(--primary)" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="feed-content">
        <div className="alert alert-danger" role="alert">
          {error || "Post not found"}
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Posts
        </button>
      </div>
    );
  }

  const sender = typeof post.sender === "string" ? senderInfo : post.sender;

  return (
    <>
      {/* Top bar */}
      <div className="app-topbar">
        <button
          className="btn btn-sm btn-light d-flex align-items-center gap-1"
          onClick={() => navigate("/")}
          style={{ borderRadius: "20px" }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h5 className="mb-0 fw-bold">Post Detail</h5>
      </div>

      <div className="feed-content">
        <div className="card mb-4">
          {post.img && (
            <img
              src={post.img}
              alt="Post"
              className="w-100"
              style={{
                maxHeight: "500px",
                objectFit: "contain",
                backgroundColor: "#f8f9fa",
                borderRadius: "14px 14px 0 0",
              }}
            />
          )}
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-3">
              {(sender as User)?.profilePicture ? (
                <img
                  src={(sender as User).profilePicture}
                  alt=""
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--primary)",
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {((sender as User)?.userName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="fw-semibold" style={{ fontSize: "0.95rem" }}>
                  {sender?.userName || sender?.email || "Unknown"}
                </div>
                <small className="text-muted">
                  {new Date(post.createdAt || "").toLocaleDateString()}
                </small>
              </div>
            </div>
            <p className="card-text">{post.text}</p>
          </div>
        </div>

        <h5 className="mb-3">Comments ({comments.length})</h5>

        {user && (
          <AddCommentForm
            postId={post._id}
            onCommentAdded={handleCommentAdded}
          />
        )}

        <CommentList
          comments={comments}
          currentUserId={user?._id || ""}
          onCommentDeleted={handleCommentDeleted}
        />
      </div>
    </>
  );
}
