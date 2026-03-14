import { type Comment, type User } from '../types';
import { useState } from 'react';
import api from '../services/api';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onCommentDeleted: () => void;
}

export default function CommentItem({ comment, currentUserId, onCommentDeleted }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if sender is an object (populated) or string (ID only)
  const sender = comment.sender ? (comment.sender as User) : null;
  const senderId = typeof comment.sender === 'string' ? comment.sender : (sender?._id || null);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsDeleting(true);
      try {
        await api.delete(`/comment/${comment._id}`);
        onCommentDeleted();
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('Failed to delete comment');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const canDelete = senderId === currentUserId;

  return (
    <div className="card mb-2">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            {sender?.profilePicture && (
              <img
                src={sender.profilePicture}
                alt={sender.userName}
                className="rounded-circle"
                style={{ width: "32px", height: "32px", objectFit: "cover", flexShrink: 0 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-grow-1">
              <h6 className="card-subtitle mb-0">
                {sender?.userName || sender?.email || 'Unknown User'}
              </h6>
              <small className="text-muted d-block">
                {new Date(comment.createdAt || '').toLocaleDateString()}
              </small>
            </div>
          </div>
          {canDelete && (
            <button
              className="btn btn-sm btn-danger ms-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          )}
        </div>
        <p className="card-text ms-5">{comment.message}</p>
      </div>
    </div>
  );
}
