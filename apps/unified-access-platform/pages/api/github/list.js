import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getOctokit } from "../../../lib/github";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.tokens?.github?.accessToken) {
    return res.status(401).json({ error: "Not connected to GitHub" });
  }
  try {
    const octokit = getOctokit(session.tokens.github.accessToken);
    const { data } = await octokit.request("GET /user/repos", {
      per_page: 20,
      sort: "updated"
    });
    res.json({
      repos: data.map(r => ({ id: r.id, name: r.full_name, private: r.private, html_url: r.html_url }))
    });
  } catch (e) {
    res.status(500).json({ error: "GitHubListFailed", details: e?.message });
  }
}