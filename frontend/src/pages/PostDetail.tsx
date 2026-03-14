import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Post, Comment, User } from '../types';
import api from '../services/api';
import CommentList from '../components/CommentList';
import AddCommentForm from '../components/AddCommentForm';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [senderInfo, setSenderInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
      if (typeof postRes.data.sender === 'string') {
        try {
          const userRes = await api.get(`/user/${postRes.data.sender}`);
          setSenderInfo(userRes.data);
        } catch (err) {
          console.error('Failed to fetch sender info:', err);
        }
      }
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
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
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Post not found'}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Posts
        </button>
      </div>
    );
  }

  const sender = typeof post.sender === 'string' ? senderInfo : post.sender;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <button className="btn btn-secondary mb-4" onClick={() => navigate('/')}>
            ← Back to Posts
          </button>

          <div className="card mb-4">
            <img src={post.img} alt="Post" className="card-img-top" style={{ maxHeight: '400px', objectFit: 'cover' }} />
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="card-title">{sender?.userName || sender?.email || 'Unknown'}</h4>
                  <p className="text-muted small">{new Date(post.createdAt || '').toLocaleDateString()}</p>
                </div>
              </div>
              <p className="card-text">{post.text}</p>
            </div>
          </div>

          <h5 className="mb-4">Comments ({comments.length})</h5>

          {user && <AddCommentForm postId={post._id} onCommentAdded={handleCommentAdded} />}

          <CommentList
            comments={comments}
            currentUserId={user?._id || ''}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>
    </div>
  );
}
