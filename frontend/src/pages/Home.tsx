import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Post } from '../types';
import api from '../services/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, [token, navigate]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/post');
      // Sort by createdAt (descending) first, then by updatedAt (descending)
      const sortedPosts = [...response.data].sort((a, b) => {
        const createdAtA = new Date(a.createdAt || 0).getTime();
        const createdAtB = new Date(b.createdAt || 0).getTime();
        
        if (createdAtA !== createdAtB) {
          return createdAtB - createdAtA; // Most recent first
        }
        
        const updatedAtA = new Date(a.updatedAt || 0).getTime();
        const updatedAtB = new Date(b.updatedAt || 0).getTime();
        return updatedAtB - updatedAtA; // Most recently updated first
      });
      
      setPosts(sortedPosts);
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load posts');
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
      <div className="container mt-5">
        <div className="alert alert-info">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Posts Feed</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Post
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="alert alert-info text-center">
              No posts yet. Be the first to create one!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={user._id}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}

          <CreatePostModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onPostCreated={handlePostCreated}
          />
        </div>
      </div>
    </div>
  );
}
