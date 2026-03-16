import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import type { Post, PaginatedPosts } from "../types";
import api from "../services/api";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";

const POSTS_PER_PAGE = 10;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const response = await api.get<PaginatedPosts>(
        `/post?page=${pageNum}&limit=${POSTS_PER_PAGE}`,
      );
      const { posts: newPosts, pages } = response.data;

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setPage(pageNum);
      setHasMore(pageNum < pages);
      setError("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load posts");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPosts(1);
  }, [token, navigate, fetchPosts]);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll(page, hasMore, isLoadingMore, fetchPosts);

  const handlePostCreated = async () => {
    setShowCreateModal(false);
    // Reload from first page so new post appears at top
    await fetchPosts(1);
  };

  const handlePostDeleted = async () => {
    await fetchPosts(1);
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
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user._id}
                onPostDeleted={handlePostDeleted}
              />
            ))}
            {hasMore && (
              <div ref={loadMoreRef} className="text-center py-4">
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{ color: "var(--primary)" }}
                >
                  <span className="visually-hidden">Loading more...</span>
                </div>
              </div>
            )}
          </>
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
