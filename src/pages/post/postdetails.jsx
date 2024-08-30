import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './post'; // Ensure this component is updated to handle individual posts
import CreateComment from '../comment/commentform'; // Component to add comments
import Comment from '../comment/comment'; // Component to display comments
import './login.css';
import API_URL from '../config';

export default function PostDetails({ params }) {
  const postId = params.id; // Extract post ID from route params
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/${postId}`);
      setPost(response.data);
    } catch (error) {
      setError('Error fetching post');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      setError('Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    fetchComments(); // Refresh comments when a new one is added
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="post-details">
      {post && (
        <Post
          id={post.id}
          title={post.title}
          body={post.body}
          author={post.username}
          timestamp={post.created_at}
          currentUser={post.currentUser} // Ensure currentUser is available
        />
      )}
      <CreateComment postId={postId} onCommentAdded={handleCommentAdded} />
      <div className="comments">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} onCommentAdded={handleCommentAdded} currentUser={post.currentUser} />
        ))}
      </div>
    </div>
  );
}
