const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();

// 1. Fix CORS to allow your Frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST']
}));

app.use(express.json());

// 2. Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://jmoupuqxkpkcnzyaejla.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptb3VwdXF4a3BrY256eWFlamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDI4ODMsImV4cCI6MjA5MDExODg4M30.rr5ICak5Pq8wFc65QFouVJFzEDzhENm0HwBtfxYtZgU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3. The Sync Route
app.post('/api/sync-repos', async (req, res) => {
  const { userId, token } = req.body;

  try {
    console.log("🚀 Starting sync for User:", userId);

    const response = await axios.get('https://api.github.com/user/repos?per_page=100', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const reposToUpsert = response.data.map(repo => ({
      id: repo.id,
      user_id: userId,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      synced_at: new Date()
    }));

    const { error } = await supabase
      .from('repositories')
      .upsert(reposToUpsert);

    if (error) {
      console.error("❌ Supabase Error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Successfully synced ${reposToUpsert.length} repos`);
    res.json({ message: 'Sync Complete' });

  } catch (error) {
    console.error("❌ GitHub/Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. GitHub routes
const githubRoutes = require('./routes/github.routes');
app.use('/api/github', githubRoutes);

// 5. CRITICAL: This keeps the server running!
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SERVER IS ALIVE ON PORT ${PORT}`);
});