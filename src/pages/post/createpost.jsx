import React, { useState } from 'react';
import axios from 'axios';
import './createpost.css';
import API_URL from '../config';

export default function CreatePost({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/posts`, {
        title,
        body,
        spotify_track_id: selectedTrack?.id,
        spotify_track_name: selectedTrack?.name,
        spotify_album_cover: selectedTrack?.album.images[0]?.url,
      }, { withCredentials: true });
      setTitle('');
      setBody('');
      setSelectedTrack(null);
      onPostCreated(); 
    } catch (err) {
      setError('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/search-spotify`, {
        params: { query: searchQuery },
      });
      setSearchResults(response.data);
    } catch (err) {
      setError('Error searching for tracks');
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

  return (
    <div className="createpost">
      <h2>Create a New Post</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Write your post..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Search Spotify..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
            <img src={selectedTrack.album.images[0].url} alt="Album cover" />
            <div className="selected-track-info">
              <h3>Selected Track</h3>
              <p>{selectedTrack.name} by {selectedTrack.artists.map(artist => artist.name).join(', ')}</p>
              <button type="button" className="deselect-button" onClick={handleDeselectTrack}>Deselect Track</button>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}
