import { useState } from 'react';
import api from '../services/api';

interface AddCommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function AddCommentForm({ postId, onCommentAdded }: AddCommentFormProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/comment', { message, postId });
      setMessage('');
      onCommentAdded();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h6 className="card-title">Add a Comment</h6>
        {error && (
          <div className="alert alert-danger alert-sm" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your comment here..."
              disabled={isLoading}
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
