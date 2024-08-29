import React from 'react';

export default function SpotifyPlayer({ trackId }) {
    return (
        <div className="spotify-player">
            <iframe
                src={`https://open.spotify.com/embed/track/${trackId}`}
                width="300"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                allowtransparency="true"
                title="Spotify Player"
            />
        </div>
    );
}
