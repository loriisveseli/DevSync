import axios from 'axios';

const API_URL = 'http://localhost:5000/api/github';

export const getRepos = async () => {
  const response = await axios.get(`${API_URL}/repos`);
  return response.data;
};

export const getCommits = async (owner, repo) => {
  const response = await axios.get(`${API_URL}/commits/${owner}/${repo}`);
  return response.data;
};