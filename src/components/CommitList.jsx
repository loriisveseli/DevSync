const CommitList = ({ commits, repoName }) => {
  const handleSync = async (commit) => {
    try {
      await fetch('http://localhost:5000/api/github/tasks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commit })
      });
      alert("✅ Task synced to DevSync Board!");
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  return (
    <div className="mt-8 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Unmapped Commits (Backlog)</h2>
      <div className="space-y-3">
        {commits.map((c) => (
          <div key={c.sha} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-200">{c.commit.message}</p>
              <p className="text-xs text-slate-500 mt-1">By {c.commit.author.name}</p>
            </div>
            <button 
              onClick={() => handleSync(c)}
              className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/50 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-all"
            >
              + Create Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};