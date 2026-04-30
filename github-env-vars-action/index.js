// Franz Diebold

const fs = require('fs');
const os = require('os');

const core = {
  exportVariable(name, value) {
    const stringValue = value == null ? '' : String(value);
    process.env[name] = stringValue;

    if (process.env.GITHUB_ENV) {
      const delimiter = `ghenv_${name}_${Date.now()}`;
      const command = `${name}<<${delimiter}${os.EOL}` +
          `${stringValue}${os.EOL}${delimiter}${os.EOL}`;
      fs.appendFileSync(
          process.env.GITHUB_ENV,
          command,
      );
    }
  },
  info(message) {
    console.log(message);
  },
  setFailed(message) {
    process.exitCode = 1;
    console.error(message);
  },
};

/**
 * Load the GitHub Actions event payload from disk.
 * @return {Object} The parsed event payload, or an empty object.
 */
function loadEventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  } catch (error) {
    core.info(`Unable to read GitHub event payload: ${error.message}`);
    return {};
  }
}

const github = {context: {payload: loadEventPayload()}};

/**
 * Slugify a given string.
 * @param {string} inputString
 * @return {string} The slugified string.
 */
function slugify(inputString) {
  return inputString
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, ' ') // remove invalid chars
      .replace(/^\s+|\s+$/g, '') // trim
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
}

/**
 * Get the repository owner from the repository string.
 * @param {string} repository
 * @return {string} The owner of the repository.
 */
function getRepositoryOwner(repository) {
  return repository ? repository.split('/')[0] : null;
}

/**
 * Get the repository name from the repository string.
 * @param {string} repository
 * @return {string} The name of the repository.
 */
function getRepositoryName(repository) {
  return repository ? repository.split('/')[1] : null;
}

/**
 * Get the ref name from the ref string.
 * @param {string} ref
 * @return {string} The ref name.
 */
function getRefName(ref) {
  return ref ? ref.split('/').slice(2).join('/') : null;
}

/**
 * Get the short SHA from the full SHA.
 * @param {string} fullSha
 * @return {string} The short SHA.
 */
function getShaShort(fullSha) {
  return fullSha ? fullSha.substring(0, 8) : null;
}

/**
 * Should we skip the deployment step?
 *
 * @param {string} branch
 * @param {string} prTitle
 * @return {boolean} True when deployment should be skipped.
 */
function shouldSkipDeploy(branch, prTitle) {
  if ((prTitle || '').toLowerCase().includes('[skip deploy]')) {
    return true;
  }
  return (branch || '').toLowerCase().includes('skipdeploy');
}

// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables

try {
  // i.e. FranzDiebold/github-env-vars-action
  const repository = process.env.GITHUB_REPOSITORY;

  if (repository) {
    core.exportVariable('CI_REPOSITORY_SLUG', slugify(repository));
    core.info(`Set CI_REPOSITORY_SLUG=` + `${process.env.CI_REPOSITORY_SLUG}`);
  } else {
    core.info(
        'Environment variable "GITHUB_REPOSITORY" not set. ' +
        'Cannot set "CI_REPOSITORY_SLUG".',
    );
  }

  const repositoryOwner = getRepositoryOwner(repository);
  if (repositoryOwner) {
    core.exportVariable('CI_REPOSITORY_OWNER', repositoryOwner);
    core.info(
        `Set CI_REPOSITORY_OWNER=` + `${process.env.CI_REPOSITORY_OWNER}`,
    );

    core.exportVariable('CI_REPOSITORY_OWNER_SLUG', slugify(repositoryOwner));
    core.info(
        `Set CI_REPOSITORY_OWNER_SLUG=` +
        `${process.env.CI_REPOSITORY_OWNER_SLUG}`,
    );
  } else {
    core.info(
        'Environment variable "GITHUB_REPOSITORY" not set. ' +
        'Cannot set "CI_REPOSITORY_OWNER" and ' +
        '"CI_REPOSITORY_OWNER_SLUG".',
    );
  }

  const repositoryName = getRepositoryName(repository);
  if (repositoryName) {
    core.exportVariable('CI_REPOSITORY_NAME', repositoryName);
    core.info(`Set CI_REPOSITORY_NAME=` + `${process.env.CI_REPOSITORY_NAME}`);

    core.exportVariable('CI_REPOSITORY_NAME_SLUG', slugify(repositoryName));
    core.info(
        'Set CI_REPOSITORY_NAME_SLUG=' +
        `${process.env.CI_REPOSITORY_NAME_SLUG}`,
    );
  } else {
    core.info(
        'Environment variable "GITHUB_REPOSITORY" not set. ' +
        'Cannot set "CI_REPOSITORY_NAME" and ' +
        '"CI_REPOSITORY_NAME_SLUG".',
    );
  }

  core.exportVariable('CI_REPOSITORY', repository);
  core.info(`Set CI_REPOSITORY=${process.env.CI_REPOSITORY}`);

  // i.e. refs/heads/feat/feature-branch-1
  const ref = process.env.GITHUB_REF;

  if (ref) {
    core.exportVariable('CI_REF_SLUG', slugify(ref));
    core.info(`Set CI_REF_SLUG=${process.env.CI_REF_SLUG}`);
  } else {
    core.info(
        'Environment variable "GITHUB_REF" not set. ' +
        'Cannot set "CI_REF_SLUG".',
    );
  }

  const refName = getRefName(ref);
  if (refName) {
    core.exportVariable('CI_REF_NAME', refName);
    core.info(`Set CI_REF_NAME=${process.env.CI_REF_NAME}`);

    core.exportVariable('CI_REF_NAME_SLUG', slugify(refName));
    core.info(`Set CI_REF_NAME_SLUG=${process.env.CI_REF_NAME_SLUG}`);
  } else {
    core.info(
        'Environment variable "GITHUB_REF" not set. ' +
        'Cannot set "CI_REF_NAME" and ' +
        '"CI_REF_NAME_SLUG".',
    );
  }

  core.exportVariable('CI_REF', ref);
  core.info(`Set CI_REF=${process.env.CI_REF}`);

  const headRef = process.env.GITHUB_HEAD_REF;

  const branchName = headRef || refName;

  if (branchName) {
    core.exportVariable('CI_ACTION_REF_NAME', branchName);
    core.info(`Set CI_ACTION_REF_NAME=${process.env.CI_ACTION_REF_NAME}`);

    core.exportVariable('CI_ACTION_REF_NAME_SLUG', slugify(branchName));
    core.info(
        'Set CI_ACTION_REF_NAME_SLUG=' +
        `${process.env.CI_ACTION_REF_NAME_SLUG}`,
    );
  } else {
    core.info(
        'Environment variables "GITHUB_REF" and ' +
        '"GITHUB_HEAD_REF" not set. ' +
        'Cannot set "CI_ACTION_REF_NAME" and ' +
        '"CI_ACTION_REF_NAME_SLUG".',
    );
  }

  if (headRef) {
    core.exportVariable('CI_HEAD_REF_SLUG', slugify(headRef));
    core.info(`Set CI_HEAD_REF_SLUG=${process.env.CI_HEAD_REF_SLUG}`);
  } else {
    core.info(
        'Environment variable "GITHUB_HEAD_REF" not set. ' +
        'Cannot set "CI_HEAD_REF_SLUG".',
    );
  }

  core.exportVariable('CI_HEAD_REF', headRef);
  core.info(`Set CI_HEAD_REF=${process.env.CI_HEAD_REF}`);

  const baseRef = process.env.GITHUB_BASE_REF;

  if (baseRef) {
    core.exportVariable('CI_BASE_REF_SLUG', slugify(baseRef));
    core.info(`Set CI_BASE_REF_SLUG=${process.env.CI_BASE_REF_SLUG}`);
  } else {
    core.info(
        'Environment variable "GITHUB_BASE_REF" not set. ' +
        'Cannot set "CI_BASE_REF_SLUG".',
    );
  }

  core.exportVariable('CI_BASE_REF', baseRef);
  core.info(`Set CI_BASE_REF=${process.env.CI_BASE_REF}`);

  const pullRequest =
    github.context.payload && github.context.payload.pull_request;

  if (pullRequest) {
    const prTitle = pullRequest.title;
    core.exportVariable('CI_PR_TITLE', prTitle);
    core.info(`Set CI_PR_TITLE=${process.env.CI_PR_TITLE}`);

    const prDescription = pullRequest.body;
    core.exportVariable('CI_PR_DESCRIPTION', prDescription);
    core.info(`Set CI_PR_DESCRIPTION=${process.env.CI_PR_DESCRIPTION}`);

    const prSha = pullRequest.head.sha;
    core.exportVariable('CI_PR_SHA_SHORT', getShaShort(prSha));
    core.info(`Set CI_PR_SHA_SHORT=${process.env.CI_PR_SHA_SHORT}`);

    core.exportVariable('CI_PR_SHA', prSha);
    core.info(`Set CI_PR_SHA=${process.env.CI_PR_SHA}`);

    const prNumber = pullRequest.number;
    core.exportVariable('CI_PR_NUMBER', prNumber);
    core.info(`Set CI_PR_NUMBER=${process.env.CI_PR_NUMBER}`);

    core.exportVariable('CI_PR_ID', prNumber);
    core.info(`Set CI_PR_ID=${process.env.CI_PR_ID}`);
  } else {
    core.info('No pull request. ' +
      'Cannot set "CI_PR_SHA_SHORT", "CI_PR_SHA", "CI_PR_NUMBER", ' +
      '"CI_PR_ID", "CI_PR_TITLE" and "CI_PR_DESCRIPTION".');
  }

  const actor = process.env.GITHUB_ACTOR;
  core.exportVariable('CI_ACTOR', actor);
  core.info(`Set CI_ACTOR=${process.env.CI_ACTOR}`);

  const eventName = process.env.GITHUB_EVENT_NAME;
  core.exportVariable('CI_EVENT_NAME', eventName);
  core.info(`Set CI_EVENT_NAME=${process.env.CI_EVENT_NAME}`);

  const runId = process.env.GITHUB_RUN_ID;
  core.exportVariable('CI_RUN_ID', runId);
  core.info(`Set CI_RUN_ID=${process.env.CI_RUN_ID}`);

  const runNumber = process.env.GITHUB_RUN_NUMBER;
  core.exportVariable('CI_RUN_NUMBER', runNumber);
  core.info(`Set CI_RUN_NUMBER=${process.env.CI_RUN_NUMBER}`);

  const workflow = process.env.GITHUB_WORKFLOW;
  core.exportVariable('CI_WORKFLOW', workflow);
  core.info(`Set CI_WORKFLOW=${process.env.CI_WORKFLOW}`);

  const action = process.env.GITHUB_ACTION;
  core.exportVariable('CI_ACTION', action);
  core.info(`Set CI_ACTION=${process.env.CI_ACTION}`);

  // hipages custom variables

  const repoSlug = process.env.CI_REPOSITORY_NAME_SLUG;

  const appName = process.env.CI_REPOSITORY_NAME_SLUG;
  core.exportVariable('CI_HIPAGES_APP_NAME', appName);
  core.info(`Set CI_HIPAGES_APP_NAME=${process.env.CI_HIPAGES_APP_NAME}`);

  if (pullRequest) {
    // Set SHA to the PR head commit for the deploy step.
    // i.e. ffac537e6cbbf934b08745a378932722df287a53
    const headSha = github.context.payload.pull_request.head.sha;
    core.exportVariable('CI_SHA', headSha);
    core.info(`Set CI_SHA=${process.env.CI_SHA}`);

    core.exportVariable('CI_SHA_SHORT', getShaShort(headSha));
    core.info(`Set CI_SHA_SHORT=${process.env.CI_SHA_SHORT}`);

    // Set correct branch name for PRs
    const branchSlug = process.env.CI_HEAD_REF_SLUG;
    core.exportVariable(
        'CI_HIPAGES_RELEASE_NAME',
        repoSlug + '-' + branchSlug,
    );
    core.info(
        `Set CI_HIPAGES_RELEASE_NAME=${process.env.CI_HIPAGES_RELEASE_NAME}`,
    );

    core.exportVariable('CI_HIPAGES_BRANCH_SLUG', branchSlug);
    core.info(
        `Set CI_HIPAGES_BRANCH_SLUG=${process.env.CI_HIPAGES_BRANCH_SLUG}`,
    );
  } else {
    const sha = process.env.GITHUB_SHA;

    core.exportVariable('CI_SHA_SHORT', getShaShort(sha));
    core.info(`Set CI_SHA_SHORT=${process.env.CI_SHA_SHORT}`);

    core.exportVariable('CI_SHA', sha);
    core.info(`Set CI_SHA=${process.env.CI_SHA}`);

    const branchSlug = process.env.CI_REF_NAME_SLUG;
    core.exportVariable(
        'CI_HIPAGES_RELEASE_NAME',
        repoSlug + '-' + branchSlug,
    );
    core.info(
        `Set CI_HIPAGES_RELEASE_NAME=${process.env.CI_HIPAGES_RELEASE_NAME}`,
    );

    core.exportVariable('CI_HIPAGES_BRANCH_SLUG', branchSlug);
    core.info(
        `Set CI_HIPAGES_BRANCH_SLUG=${process.env.CI_HIPAGES_BRANCH_SLUG}`,
    );
  }

  // Sets CI_HIPAGES_IS_MASTER when branch name is master
  if (process.env.CI_HIPAGES_BRANCH_SLUG.toLowerCase() === 'master') {
    core.exportVariable('CI_HIPAGES_IS_MASTER', true);
    core.exportVariable('CI_HIPAGES_IS_MASTER_INT', 1);
    core.info(`Set CI_HIPAGES_IS_MASTER=true`);
  } else {
    core.exportVariable('CI_HIPAGES_IS_MASTER', false);
    core.exportVariable('CI_HIPAGES_IS_MASTER_INT', 0);
    core.info(`Set CI_HIPAGES_IS_MASTER=false`);
  }

  // Check if we should skip deployment
  core.info(`Checking if we should skip deployment...`);

  if (shouldSkipDeploy(branchName, process.env.CI_PR_TITLE)) {
    core.exportVariable('CI_HIPAGES_SKIP_DEPLOY', true);
    core.info(`Setting CI_HIPAGES_SKIP_DEPLOY to true`);
  }
} catch (error) {
  core.setFailed(error.message);
}

module.exports = {
  slugify,
  getRepositoryOwner,
  getRepositoryName,
  getRefName,
  getShaShort,
};
