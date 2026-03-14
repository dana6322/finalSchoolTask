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
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4">AI-Powered Search</h1>
          <p className="text-muted mb-4">
            Ask anything about the posts and discussions in SocialHub. Our AI
            will find and summarize relevant content for you.
          </p>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group input-group-lg">
              <input
                type="text"
                className="form-control"
                placeholder='Try: "What are people discussing?" or "Find posts about..."'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isLoading || !query.trim()}
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
                  "🤖 Search"
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Searching...</span>
              </div>
              <p className="mt-3 text-muted">AI is analyzing your content...</p>
            </div>
          )}

          {!isLoading && hasSearched && answer && (
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <strong>🤖 AI Answer</strong>
              </div>
              <div className="card-body">
                <p className="card-text" style={{ whiteSpace: "pre-line" }}>
                  {answer}
                </p>
              </div>
            </div>
          )}

          {!isLoading && hasSearched && relevantPosts.length > 0 && (
            <>
              <h5 className="mb-3">Relevant Posts ({relevantPosts.length})</h5>
              <div className="space-y-4">
                {relevantPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user._id}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </div>
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
      </div>
    </div>
  );
}
