import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [driveFiles, setDriveFiles] = useState([]);
  const [repos, setRepos] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [aiReply, setAiReply] = useState("");

  const connected = {
    google: !!session?.providers?.google,
    github: !!session?.providers?.github
  };

  useEffect(() => {
    if (connected.google) {
      fetch("/api/drive/list").then(r => r.json()).then(d => setDriveFiles(d.files || []));
    }
  }, [connected.google]);

  useEffect(() => {
    if (connected.github) {
      fetch("/api/github/list").then(r => r.json()).then(d => setRepos(d.repos || []));
    }
  }, [connected.github]);

  async function askAI(e) {
    e.preventDefault();
    setAiReply("Thinking...");
    const res = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    setAiReply(data.message || data.error || "");
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1>Unified Access Platform</h1>
        <p>Connect Google Drive, GitHub, and AI in one dashboard</p>
      </header>

      {status === "loading" && <p>Loading...</p>}

      {!session && (
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2>Sign in to get started</h2>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => signIn("google")} style={{ padding: "10px 20px", backgroundColor: "#4285f4", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Sign in with Google
            </button>
            <button onClick={() => signIn("github")} style={{ padding: "10px 20px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Sign in with GitHub
            </button>
          </div>
        </div>
      )}

      {session && (
        <>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p>Welcome, {session.user?.email || session.user?.name}!</p>
            <button onClick={() => signOut()} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Sign out
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            
            {/* Google Drive Section */}
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
              <h2 style={{ color: "#4285f4", marginTop: 0 }}>Google Drive Files</h2>
              {!connected.google && (
                <div>
                  <p>Connect Google Drive to see your files</p>
                  <button onClick={() => signIn("google")} style={{ padding: "8px 16px", backgroundColor: "#4285f4", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Connect Google Drive
                  </button>
                </div>
              )}
              {connected.google && (
                <div>
                  <p style={{ color: "#28a745", fontWeight: "bold" }}>✓ Connected</p>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {driveFiles.length === 0 ? (
                      <p>No files found</p>
                    ) : (
                      driveFiles.map(file => (
                        <div key={file.id} style={{ padding: "8px", borderBottom: "1px solid #eee", fontSize: "14px" }}>
                          <div style={{ fontWeight: "bold" }}>{file.name}</div>
                          <div style={{ color: "#666", fontSize: "12px" }}>
                            {file.mimeType} • {new Date(file.modifiedTime).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GitHub Section */}
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
              <h2 style={{ color: "#333", marginTop: 0 }}>GitHub Repositories</h2>
              {!connected.github && (
                <div>
                  <p>Connect GitHub to see your repositories</p>
                  <button onClick={() => signIn("github")} style={{ padding: "8px 16px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Connect GitHub
                  </button>
                </div>
              )}
              {connected.github && (
                <div>
                  <p style={{ color: "#28a745", fontWeight: "bold" }}>✓ Connected</p>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {repos.length === 0 ? (
                      <p>No repositories found</p>
                    ) : (
                      repos.map(repo => (
                        <div key={repo.id} style={{ padding: "8px", borderBottom: "1px solid #eee", fontSize: "14px" }}>
                          <div style={{ fontWeight: "bold" }}>
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0366d6", textDecoration: "none" }}>
                              {repo.name}
                            </a>
                          </div>
                          <div style={{ color: "#666", fontSize: "12px" }}>
                            {repo.private ? "🔒 Private" : "🌐 Public"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AI Section */}
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
              <h2 style={{ color: "#ff6600", marginTop: 0 }}>AI Assistant (Gemini)</h2>
              <form onSubmit={askAI}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me anything..."
                  rows={3}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical", fontFamily: "inherit" }}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  style={{ 
                    marginTop: "10px", 
                    padding: "10px 20px", 
                    backgroundColor: prompt.trim() ? "#ff6600" : "#ccc", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: prompt.trim() ? "pointer" : "not-allowed",
                    width: "100%"
                  }}
                >
                  Ask AI
                </button>
              </form>
              {aiReply && (
                <div style={{ 
                  marginTop: "20px", 
                  padding: "15px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "4px", 
                  border: "1px solid #e9ecef",
                  whiteSpace: "pre-wrap",
                  fontSize: "14px",
                  maxHeight: "200px",
                  overflowY: "auto"
                }}>
                  {aiReply}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}