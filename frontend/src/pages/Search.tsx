import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Post } from "../types";
import api from "../services/api";
import PostCard from "../components/PostCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [relevantPosts, setRelevantPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  if (!token || !user) {
    navigate("/login");
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await api.post("/ai/search", { query: query.trim() });
      setAnswer(response.data.answer);
      setRelevantPosts(response.data.relevantPosts || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Search failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDeleted = async () => {
    // Re-run the search to refresh results
    if (query.trim()) {
      handleSearch(new Event("submit") as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="app-topbar">
        <h5 className="mb-0 fw-bold">AI Search</h5>
      </div>

      <div className="feed-content">
        <p className="text-muted mb-4">
          Ask anything about the posts and discussions in SocialHub. Our AI will
          find and summarize relevant content for you.
        </p>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder='Try: "What are people discussing?" or "Find posts about..."'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              style={{ borderRadius: "20px 0 0 20px", padding: "10px 18px" }}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isLoading || !query.trim()}
              style={{ borderRadius: "0 20px 20px 0", padding: "10px 20px" }}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Searching...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-magnifying-glass me-1"></i> Search
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "var(--primary)" }}
            >
              <span className="visually-hidden">Searching...</span>
            </div>
            <p className="mt-3 text-muted">AI is analyzing your content...</p>
          </div>
        )}

        {!isLoading && hasSearched && answer && (
          <div
            className="card mb-4"
            style={{ borderLeft: "4px solid var(--primary)" }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i
                  className="fa-solid fa-robot"
                  style={{ color: "var(--primary)" }}
                ></i>
                <strong>AI Answer</strong>
              </div>
              <p className="card-text mb-0" style={{ whiteSpace: "pre-line" }}>
                {answer}
              </p>
            </div>
          </div>
        )}

        {!isLoading && hasSearched && relevantPosts.length > 0 && (
          <>
            <h5 className="mb-3">Relevant Posts ({relevantPosts.length})</h5>
            {relevantPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user._id}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </>
        )}

        {!isLoading &&
          hasSearched &&
          !answer &&
          relevantPosts.length === 0 &&
          !error && (
            <div className="alert alert-info text-center">
              No results found. Try a different search query.
            </div>
          )}
      </div>
    </>
  );
}
