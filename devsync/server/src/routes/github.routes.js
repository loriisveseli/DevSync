const express = require('express');
const router = express.Router();
const githubController = require('../controllers/github.controller');
const supabase = require('../supabaseClient');

router.get('/repos', githubController.getRepos);
router.get('/commits/:owner/:repo', githubController.getCommits);
router.post('/tasks/sync', githubController.syncTask);

router.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id);

  if (error) return res.status(500).json(error);
  res.json(data);
});

module.exports = router;