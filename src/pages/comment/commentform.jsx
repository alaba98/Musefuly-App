import React, { useState } from 'react';
import axios from 'axios';
import './commentform.css'; 

export default function CommentForm({ postId, parentId, onCommentAdded }) {
    const [commentBody, setCommentBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post('http://localhost:3001/comments', {
                postId,
                parentId,
                body: commentBody
            }, { withCredentials: true });

            setCommentBody('');
            onCommentAdded(); // Notify parent to refresh the comment list
            setIsFormVisible(false); // Hide the form after successful submission
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(prev => !prev); // Toggle the visibility state
    };

    return (
        <div>
         
            {!isFormVisible && (
                <button className="reply-button" onClick={toggleFormVisibility}>
                    Reply
                </button>
            )}

           
            {isFormVisible && (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    );
}
