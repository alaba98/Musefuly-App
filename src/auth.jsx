const clientId = '803d5e70b3d14cdb8b06f9106356c920'; 
const redirectUri = 'http://localhost:4173/callback'; 
const scopes = 'streaming user-read-email user-read-private'; 

export const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
