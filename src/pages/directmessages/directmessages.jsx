import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import SpotifyPlayer from '../spotify/spotifyplayer'; 
import './directmessages.css';

export default function DirectMessages() {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(friendId || '');
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedFriendId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedFriendId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:3001/me', { withCredentials: true });
      setUserId(response.data.id);
    } catch (error) {
      console.error('Fetch current user error:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedFriendId) return;

    try {
      const response = await axios.get(`http://localhost:3001/direct-messages/${selectedFriendId}`, { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get('http://localhost:3001/friends', { withCredentials: true });
      setFriends(response.data);
    } catch (error) {
      console.error('Fetch friends error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedFriendId) return;

    try {
      await axios.post('http://localhost:3001/direct-messages', {
        receiverId: selectedFriendId,
        message: newMessage,
        spotify_track_id: selectedTrack?.id,
        spotify_track_name: selectedTrack?.name,
        spotify_album_cover: selectedTrack?.album.images[0]?.url,
      }, { withCredentials: true });
      setNewMessage('');
      setSelectedTrack(null);
      fetchMessages();
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:3001/search-spotify', {
        params: { query: searchQuery },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDeselectTrack = () => {
    setSelectedTrack(null);
  };

  const handleFriendChange = (event) => {
    const newFriendId = event.target.value;
    setSelectedFriendId(newFriendId);
    navigate(`/directmessages/${newFriendId}`);
  };

  const handleBackToMessages = () => {
    setSelectedFriendId('');
    navigate('/directmessages');
  };

  const handleBackToFeed = () => {
    navigate('/feed');
  };

  return (
    <div className="direct-messages">
      <h2>Direct Messages</h2>

      {selectedFriendId && (
        <button className="back-button" onClick={handleBackToMessages}>
          Back to messages
        </button>
      )}

      {!selectedFriendId && (
        <button className="back-button" onClick={handleBackToFeed}>
          Back to Feed
        </button>
      )}

      {!selectedFriendId && (
        <select value={selectedFriendId} onChange={handleFriendChange}>
          <option value="">Select a friend</option>
          {friends.map(friend => (
            <option key={friend.id} value={friend.id}>
              {friend.username}
            </option>
          ))}
        </select>
      )}

      {selectedFriendId && (
        <div className="messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
            >
              {msg.sender_id !== userId && <strong>{msg.sender_username}</strong>}
              <p>{msg.message}</p>
              {msg.spotify_track_id && (
                <div className="spotify-player">
                  <SpotifyPlayer trackId={msg.spotify_track_id} />
                </div>
              )}
              <span className="message-time">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedFriendId && (
        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}

      {selectedFriendId && (
        <div className="spotify-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Spotify..."
          />
          <button type="button" onClick={handleSearch}>Search</button>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(track => (
                <div
                  key={track.id}
                  className="search-result-item"
                  onClick={() => handleSelectTrack(track)}
                >
                  {track.album.images[0] && (
                    <img
                      src={track.album.images[0].url}
                      alt={`${track.name} album cover`}
                      className="track-image"
                    />
                  )}
                  <p>{track.name} by {track.artists.map(artist => artist.name).join(', ')}</p>
                </div>
              ))}
            </div>
          )}

          {selectedTrack && (
            <div className="selected-track">
              <h3>Selected Track</h3>
              <p>{selectedTrack.name} by {selectedTrack.artists.map(artist => artist.name).join(', ')}</p>
              {selectedTrack.album.images[0] && <img src={selectedTrack.album.images[0].url} alt="Album cover" />}
              <button className="deselect-button" onClick={handleDeselectTrack}>Deselect</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
