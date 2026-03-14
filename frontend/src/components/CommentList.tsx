import type { Comment } from '../types';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onCommentDeleted: () => void;
}

export default function CommentList({ comments, currentUserId, onCommentDeleted }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="alert alert-info">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          currentUserId={currentUserId}
          onCommentDeleted={onCommentDeleted}
        />
      ))}
    </div>
  );
}
