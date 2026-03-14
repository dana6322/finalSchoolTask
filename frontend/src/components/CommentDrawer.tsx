import { useState, useEffect, useRef, useCallback } from "react";
import type { Comment, User } from "../types";
import api from "../services/api";

interface CommentDrawerProps {
  postId: string;
  currentUserId: string;
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export default function CommentDrawer({
  postId,
  currentUserId,
  open,
  onClose,
  onCountChange,
}: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/comment?postId=${postId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setComments(data);
      onCountChange?.(data.length);
    } catch {
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId, onCountChange]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, fetchComments]);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError("");
    setIsSending(true);
    try {
      await api.post("/comment", { message: message.trim(), postId });
      setMessage("");
      await fetchComments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/comment/${commentId}`);
      await fetchComments();
    } catch {
      alert("Failed to delete comment");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="comment-drawer-backdrop" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`comment-drawer ${open ? "comment-drawer--open" : ""}`}
      >
        {/* Header */}
        <div className="comment-drawer-header">
          <h6 className="mb-0 fw-bold">Comments</h6>
          <button
            className="btn btn-sm"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.1rem" }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Comment list */}
        <div className="comment-drawer-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                style={{ color: "var(--primary)" }}
              />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted py-5" style={{ fontSize: "0.9rem" }}>
              <i className="fa-regular fa-comment-dots" style={{ fontSize: "2rem", opacity: 0.4 }}></i>
              <p className="mt-2 mb-0">No comments yet.</p>
              <p className="mb-0">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const sender = comment.sender
                ? (comment.sender as User)
                : null;
              const senderId =
                typeof comment.sender === "string"
                  ? comment.sender
                  : sender?._id || null;
              const canDelete = senderId === currentUserId;

              return (
                <div key={comment._id} className="comment-drawer-item">
                  <div className="d-flex align-items-start gap-2">
                    {sender?.profilePicture ? (
                      <img
                        src={sender.profilePicture}
                        alt=""
                        className="rounded-circle"
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "var(--primary)",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="text-white fw-bold"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {(sender?.userName || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                          {sender?.userName || sender?.email || "User"}
                        </span>
                        {canDelete && (
                          <button
                            className="btn btn-sm p-0"
                            onClick={() => handleDelete(comment._id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-secondary)",
                              fontSize: "0.75rem",
                            }}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                      </div>
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "0.88rem",
                          color: "var(--text-primary)",
                          wordBreak: "break-word",
                        }}
                      >
                        {comment.message}
                      </p>
                      <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {new Date(comment.createdAt || "").toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={listEndRef} />
        </div>

        {/* Chat input */}
        <div className="comment-drawer-footer">
          {error && (
            <div
              className="text-danger mb-1"
              style={{ fontSize: "0.78rem" }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSend} className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Write a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              style={{
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "0.88rem",
                backgroundColor: "#f4f5fa",
                border: "none",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSending || !message.trim()}
              style={{
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isSending ? (
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: "14px", height: "14px" }}
                />
              ) : (
                <i className="fa-solid fa-paper-plane" style={{ fontSize: "0.8rem" }}></i>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
