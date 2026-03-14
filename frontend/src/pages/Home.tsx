import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Post } from "../types";
import api from "../services/api";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPosts();
  }, [token, navigate]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/post");
      const sortedPosts = [...response.data].sort((a, b) => {
        const createdAtA = new Date(a.createdAt || 0).getTime();
        const createdAtB = new Date(b.createdAt || 0).getTime();

        if (createdAtA !== createdAtB) {
          return createdAtB - createdAtA;
        }

        const updatedAtA = new Date(a.updatedAt || 0).getTime();
        const updatedAtB = new Date(b.updatedAt || 0).getTime();
        return updatedAtB - updatedAtA;
      });

      setPosts(sortedPosts);
      setError("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = async () => {
    setShowCreateModal(false);
    await fetchPosts();
  };

  const handlePostDeleted = async () => {
    await fetchPosts();
  };

  if (!user) {
    return (
      <div className="feed-content">
        <div className="alert alert-info">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top bar */}
      <div className="app-topbar">
        <h5 className="mb-0 fw-bold" style={{ whiteSpace: "nowrap" }}>
          Feed
        </h5>
        <div className="topbar-actions">
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            onClick={() => setShowCreateModal(true)}
            style={{
              borderRadius: "20px",
              padding: "6px 18px",
              whiteSpace: "nowrap",
            }}
          >
            <i className="fa-solid fa-plus"></i> Add New Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="feed-content">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "var(--primary)" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="alert alert-info text-center">
            No posts yet. Be the first to create one!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user._id}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}

        <CreatePostModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </>
  );
}
