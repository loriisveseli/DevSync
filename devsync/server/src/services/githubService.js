const axios = require('axios');

// For now, using public access. 
// Tip: Add a Personal Access Token in .env as 'GITHUB_TOKEN' to avoid rate limits.
const GITHUB_BASE_URL = 'https://api.github.com';

const githubService = {
  fetchRepos: async (username = 'facebook') => {
    const response = await axios.get(`${GITHUB_BASE_URL}/users/${username}/repos`);
    return response.data;
  },

  fetchCommits: async (owner, repo) => {
    const response = await axios.get(`${GITHUB_BASE_URL}/repos/${owner}/${repo}/commits`);
    return response.data;
  }
};

module.exports = githubService;