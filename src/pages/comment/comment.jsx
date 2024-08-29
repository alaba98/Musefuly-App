import React, { useState } from 'react';
import axios from 'axios';
import CommentForm from './commentform';
import './comment.css';

export default function Comment({ comment, onCommentAdded, currentUser, level = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [areRepliesVisible, setAreRepliesVisible] = useState(true); // State for replies visibility

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const toggleRepliesVisibility = () => {
    setAreRepliesVisible(!areRepliesVisible); // Toggle the visibility state
  };

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`http://localhost:3001/comments/${comment.id}`, { withCredentials: true });
      onCommentAdded(); // Refresh 
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentAdded = () => {
    setShowReplyForm(false); // Hide the reply form after adding a comment
    onCommentAdded(); 
  };

  // Apply the CSS variable for indentation
  const commentStyle = { '--level': Math.min(level, 10) }; 

  // Conditional class for replies
  const commentClass = level > 0 ? 'comment reply' : 'comment';

  return (
    <div className="comment-wrapper">
      <div className={commentClass} style={commentStyle}>
        <p>{comment.body}</p>
        <small>By {comment.username} on {new Date(comment.created_at).toLocaleString()}</small>
        {currentUser === comment.username && (
          <button className="delete-button" onClick={handleDeleteComment}>
            Delete 
          </button>
        )}
        <button className="reply-button" onClick={toggleReplyForm}>
          {showReplyForm ? 'Cancel' : 'Reply'}
        </button>

        {showReplyForm && (
          <CommentForm
            postId={comment.post_id}
            parentId={comment.id}
            onCommentAdded={handleCommentAdded}
          />
        )}

        {/* Add button to toggle replies visibility */}
        {comment.replies && comment.replies.length > 0 && (
          <>
            <button className="toggle-replies-button" onClick={toggleRepliesVisibility}>
              {areRepliesVisible ? 'Hide Replies' : 'Show Replies'}
            </button>
            {areRepliesVisible && (
              <div className="replies">
                {comment.replies.map(reply => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    onCommentAdded={onCommentAdded}
                    currentUser={currentUser}
                    level={level + 1} // Increment the level for child comments
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
