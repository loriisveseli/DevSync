const githubService = require('../services/githubService'); // Removed the dot before 'service'
const getRepos = async (req, res) => {
  try {
    const repos = await githubService.fetchRepos();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching repositories", error: error.message });
  }
};

const getCommits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const commits = await githubService.fetchCommits(owner, repo);
    res.json(commits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching commits", error: error.message });
  }
};

const supabase = require('../supabaseClient'); // Ensure this file exists from our earlier steps

const syncTask = async (req, res) => {
  const { commit } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .upsert({ 
        github_id: commit.sha, 
        title: commit.commit.message, 
        author: commit.commit.author.name,
        status: 'In Progress' 
      })
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRepos, getCommits, syncTask };

