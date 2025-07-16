/*
──────────────────────────────────────────────────────────────
 PRODUCTION DEPLOYMENT CHECKLIST — Music Site + Spotify API
──────────────────────────────────────────────────────────────

1. Prepare your Git repo
   • Commit all local changes (backend + frontend)
   • Push to your remote (e.g. GitHub)

2. Deploy your Backend API
   a. Choose a host:
      - Heroku, Railway, Render, or Vercel Serverless Functions
      - Or a VPS/Docker + PM2/systemd
   b. Connect your Git repo and set the build command:
      - build: none (just runs npm start)
      - start: npm start
   c. Provision environment variables in the host’s dashboard:
      SPOTIFY_CLIENT_ID
      SPOTIFY_CLIENT_SECRET
      PLAYLIST_ID
      PORT (optional)
   d. Configure CORS in server.js:
      app.use(cors({ origin: 'https://your-frontend-domain.com' }));
   e. Deploy and confirm:
      - Health check: GET https://api.your-domain.com/ → “Spotify random-track service is up!”
      - API test: GET https://api.your-domain.com/api/random-track → valid JSON

3. Deploy your Frontend
   a. Choose a static host:
      - Netlify, Vercel, GitHub Pages, AWS S3 + CloudFront
   b. Point it at your frontend folder (no build if plain HTML/CSS/JS)
   c. Update your fetch URL in script.js:
      fetch('https://api.your-domain.com/api/random-track')
   d. Deploy and confirm:
      - Open https://your-frontend-domain.com/music.html
      - Network tab → /api/random-track returns JSON
      - Iframe updates with a valid Spotify embed

4. Custom Domain & SSL
   • Configure DNS (A or CNAME) to your hosts
   • Enable HTTPS/SSL via Let’s Encrypt or your host’s built-in certs
   • Verify both https://your-domain.com and https://api.your-domain.com

5. Post-Deploy
   • Monitor logs for errors/timeouts
   • (If self-hosting) ensure your process manager (PM2 or systemd) restarts on crash or reboot
   • (Optional) Set up a lightweight UptimeRobot or cron to ping your / endpoint and keep free dynos awake

6. (Bonus) Continuous Deployment
   • On push to main: auto-deploy backend and frontend
   • Use GitHub Actions, Heroku pipelines, or your host’s CI/CD hooks

============================================================================
*/
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  PLAYLIST_ID,
  PORT = 8888
} = process.env;

const app = express();
app.use(cors()); 

// Token caching
let cachedToken = null;
let tokenExpiry = 0;

// Track caching (important for 2000 tracks!)
let cachedTracks = null;
let tracksExpiry = 0;

// 1. Get an access token
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  
  const resp = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      }
    }
  );
  
  cachedToken = resp.data.access_token;
  tokenExpiry = Date.now() + resp.data.expires_in * 1000;
  return cachedToken;
}

// 2. Fetch ALL tracks from playlist (handles pagination)
async function getAllTracks() {
  // Cache tracks for 15 minutes to avoid repeated API calls
  if (cachedTracks && Date.now() < tracksExpiry) {
    console.log(`Using cached tracks (${cachedTracks.length} tracks)`);
    return cachedTracks;
  }
  
  console.log('Fetching all playlist tracks...');
  const token = await getAccessToken();
  let allTracks = [];
  let offset = 0;
  let hasMore = true;
  let requestCount = 0;
  
  while (hasMore) {
    const resp = await axios.get(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    allTracks = allTracks.concat(resp.data.items);
    hasMore = resp.data.next !== null;
    offset += 100;
    requestCount++;
    
    console.log(`Fetched ${allTracks.length} tracks so far... (Request ${requestCount})`);
  }
  
  // Filter out deleted tracks (track will be null)
  const validTracks = allTracks.filter(item => item.track && item.track.id);
  
  console.log(`Total valid tracks: ${validTracks.length}`);
  
  // Cache for 15 minutes
  cachedTracks = validTracks;
  tracksExpiry = Date.now() + 15 * 60 * 1000;
  
  return validTracks;
}

// 3. Get random track from the full playlist
async function getRandomEmbedUrl() {
  const tracks = await getAllTracks();
  
  if (tracks.length === 0) {
    throw new Error('No valid tracks found in playlist');
  }
  
  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)].track;
  return `https://open.spotify.com/embed/track/${randomTrack.id}`;
}

// 4. API endpoint
app.get('/api/random-track', async (req, res) => {
  try {
    const embedUrl = await getRandomEmbedUrl();
    res.json({ embedUrl });
  } catch (err) {
    console.error('Error fetching random track:', err);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

// 5. Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});