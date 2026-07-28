const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');

router.get('/sync/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const token = req.headers.authorization;

  try {
    const commits = await githubService.fetchCommits(owner, repo);
    res.json({
      project: repo,
      autoDetectedTasks: commits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;