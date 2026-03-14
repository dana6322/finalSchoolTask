import { type Post, type User } from "../types";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import ImageUpload from "./ImageUpload";

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
  const [commentCount, setCommentCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [editImgFile, setEditImgFile] = useState<File | null>(null);
  const [editImgPreview, setEditImgPreview] = useState(post.img || "");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Check if sender is an object (populated) or string (ID only)
  const sender = post.sender ? (post.sender as User) : null;
  const senderId =
    typeof post.sender === "string" ? post.sender : sender?._id || null;

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const res = await api.get(`/comment?postId=${post._id}`);
        setCommentCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch {
        setCommentCount(0);
      }
    };
    fetchCommentCount();
  }, [post._id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleDelete = async () => {
    setMenuOpen(false);
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

  const openEditModal = () => {
    setMenuOpen(false);
    setEditText(post.text || "");
    setEditImgFile(null);
    setEditImgPreview(post.img || "");
    setEditError("");
    setShowEditModal(true);
  };

  const handleEditFileSelect = (file: File) => {
    setEditImgFile(file);
    setEditImgPreview(URL.createObjectURL(file));
    setEditError("");
  };

  const handleEditRemoveImage = () => {
    setEditImgFile(null);
    setEditImgPreview("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editText.trim()) {
      setEditError("Post text is required");
      return;
    }

    setIsSaving(true);
    try {
      let imgUrl = editImgPreview;

      // If a new file was selected, upload it first
      if (editImgFile) {
        const formData = new FormData();
        formData.append("file", editImgFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "image/jpeg" },
        });
        imgUrl = uploadRes.data.url;
      }

      await api.put(`/post/${post._id}`, { text: editText, img: imgUrl });
      setShowEditModal(false);
      onPostDeleted(); // refresh the list
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setEditError(error.response?.data?.message || "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = senderId === currentUserId;

  return (
    <>
      <div
        className="card mb-4 shadow-sm border-0"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        {/* Header: user info + menu */}
        <div className="card-body pb-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Link to={`/user/${senderId}`}>
                {sender?.profilePicture ? (
                  <img
                    src={sender.profilePicture}
                    alt={sender.userName}
                    className="rounded-circle"
                    style={{
                      width: "42px",
                      height: "42px",
                      objectFit: "cover",
                      border: "2px solid #e9ecef",
                    }}
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

            {/* 3-dot menu */}
            {canEdit && (
              <div className="position-relative" ref={menuRef}>
                <button
                  className="btn btn-sm"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  disabled={isDeleting}
                  style={{ lineHeight: 1, background: "none", border: "none" }}
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
                {menuOpen && (
                  <div
                    className="position-absolute end-0 mt-1 shadow-sm bg-white rounded-2 border"
                    style={{ zIndex: 10, minWidth: "140px" }}
                  >
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      onClick={openEditModal}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger"
                      onClick={handleDelete}
                    >
                      <i className="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                )}
              </div>
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
          <Link
            to={`/post/${post._id}`}
            className="text-decoration-none text-muted d-inline-flex align-items-center gap-1"
            style={{ fontSize: "0.95rem" }}
          >
            <i className="fa-regular fa-comment"></i>
            <span>{commentCount}</span>
          </Link>
        </div>
      </div>

      {/* Edit Post Modal */}
      {showEditModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Post</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  {editError && (
                    <div className="alert alert-danger" role="alert">
                      {editError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor={`editText-${post._id}`} className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id={`editText-${post._id}`}
                      rows={4}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="What's on your mind?"
                      disabled={isSaving}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Photo</label>
                    <ImageUpload
                      preview={editImgPreview}
                      onFileSelect={handleEditFileSelect}
                      onRemove={handleEditRemoveImage}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
