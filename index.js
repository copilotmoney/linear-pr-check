const core = require('@actions/core');
const github = require('@actions/github');
const issuecheck = require('./issuecheck.js')

async function run() {
  try {
    const authToken = core.getInput('github_token', {required: true});

    const owner = github.context.payload.pull_request.base.user.login;
    const repo = github.context.payload.pull_request.base.repo.name;
    const pr_number = github.context.payload.pull_request.number;

    const client = new github.GitHub(authToken);
    const {data: pullRequest} = await client.pulls.get({
      owner,
      repo,
      pull_number: pr_number
    });

    const title = pullRequest.title;
    const description = pullRequest.body;
    const branch = pullRequest.head.ref;

    const issue = issuecheck.findIssue(core.getInput("prefix"), title, description, branch);
    core.info(`Issue ${issue} found`)
  } catch {
    core.setFailed("Issue not found in PR: All PRs must have an associated issue");
    core.info(`
    Linear supports three ways to link issues with your pull requests:

    1. Include *issue ID* in the branch name
    2. Include *issue ID* in the PR title
    3. Include *issue ID* with a magic word in the PR description (e.g. Fixes ENG-123) similar to GitHub Issues
    `)
  }
}

run();