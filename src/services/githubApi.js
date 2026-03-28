// Ensure there is no extra / at the end
const BASE_URL = 'http://localhost:5000/api';

export const fetchTasks = async (owner, repo) => {
  try {
    const response = await fetch(`${BASE_URL}/sync/${owner}/${repo}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};