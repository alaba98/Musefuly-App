import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Comment from '../comment/comment';
import CommentForm from '../comment/commentform';
import SpotifyPlayer from '../spotify/spotifyplayer'; 
import './post.css';

const emojiList = ['❤️', '👍', '👎', '😂', '😐', '🗑️'];

export default function Post({ id, title, body, author, timestamp, currentUser, onPostDeleted, spotifyTrackName, spotifyAlbumCover, spotifyTrackId }) {
    const [comments, setComments] = useState([]);
    const [isReplyVisible, setReplyVisible] = useState(true);
    const [reactions, setReactions] = useState({});

    useEffect(() => {
        fetchComments();
        fetchReactions();
    }, [id]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/posts/${id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const fetchReactions = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/posts/${id}/reactions`);
            const reactionCounts = {};
            response.data.forEach(({ emoji, count }) => {
                reactionCounts[emoji] = count;
            });
            setReactions(reactionCounts);
        } catch (error) {
            console.error('Error fetching reactions:', error);
        }
    };

    const handleReaction = async (emoji) => {
        try {
            await axios.post(`http://localhost:3001/posts/${id}/reactions`, { emoji }, { withCredentials: true });
            fetchReactions();
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handleCommentAdded = () => {
        fetchComments(); 
    };

    const handleDeletePost = async () => {
        try {
            await axios.delete(`http://localhost:3001/posts/${id}`, { withCredentials: true });
            if (onPostDeleted) onPostDeleted(id); // Notify parent component to remove the post
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const toggleReplyVisibility = () => {
        setReplyVisible(!isReplyVisible);
    };

    return (
        <div className="post">
            <h2>{title}</h2>
            <p>{body}</p>

            {/* Spotify track information */}
            {spotifyTrackName && (
                <div className="spotify-track">
                    {spotifyAlbumCover && <img src={spotifyAlbumCover} alt={`${spotifyTrackName} album cover`} />}
                    <p>Track: {spotifyTrackName}</p>
                </div>
            )}

            {/* Embed the Spotify player here */}
            {spotifyTrackId && (
                <SpotifyPlayer trackId={spotifyTrackId} />
            )}

            <small>By {author} on {new Date(timestamp).toLocaleString()}</small>
            {currentUser === author && (
                <button className="delete-button" onClick={handleDeletePost}>Delete Post</button>
            )}

            <div className="reactions">
                {emojiList.map((emoji) => (
                    <button
                        key={emoji}
                        className="reaction-button"
                        onClick={() => handleReaction(emoji)}
                    >
                        {emoji} {reactions[emoji] || 0}
                    </button>
                ))}
            </div>

            {isReplyVisible ? (
                <button className="hide-reply-button" onClick={toggleReplyVisibility}>
                    Hide Reply
                </button>
            ) : (
                <button className="reply-button" onClick={toggleReplyVisibility}>
                    Show Reply
                </button>
            )}

            {isReplyVisible && (
                <>
                    <CommentForm postId={id} onCommentAdded={handleCommentAdded} />
                    <div className="comments">
                        {comments.map(comment => (
                            <Comment key={comment.id} comment={comment} onCommentAdded={handleCommentAdded} currentUser={currentUser} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
