import { Octokit } from "octokit";

export function getOctokit(githubAccessToken) {
  return new Octokit({ auth: githubAccessToken });
}