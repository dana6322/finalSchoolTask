import { useState } from 'react';
import api from '../services/api';

interface CreatePostModalProps {
  show: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({ show, onClose, onPostCreated }: CreatePostModalProps) {
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim() || !img.trim()) {
      setError('Both text and image URL are required');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/post', { text, img });
      setText('');
      setImg('');
      onPostCreated();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Post</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="text" className="form-label">
                  Post Content
                </label>
                <textarea
                  className="form-control"
                  id="text"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="img" className="form-label">
                  Image URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="img"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
                {img && (
                  <img
                    src={img}
                    alt="Preview"
                    className="mt-2 img-fluid"
                    style={{ maxHeight: '200px' }}
                    onError={() => setError('Invalid image URL')}
                  />
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
