const log = require("lambda-log");
const fs = require('fs');
const {
  ECRClient,
  PutLifecyclePolicyCommand,
  PutImageScanningConfigurationCommand,
  ListRepositoriesCommand,
  paginateDescribeRepositories,
} = require("@aws-sdk/client-ecr");

const config = {
  region: process.env.AWS_REGION || "us-east-2",
}

const ecrClient = new ECRClient(config);

const setLifecyclePolicy = async (repoName, lifecyclePolicy) => {
  const params = {
    repositoryName: repoName,
    lifecyclePolicyText: lifecyclePolicy,
  };
  const command = new PutLifecyclePolicyCommand(params);
  return ecrClient.send(command);
};

const readPolicy = async (file) => {
  return fs
    .readFileSync(file, { encoding: "utf8", flag: "r" })
    .replace("\n", "");
}

const enableScanning = async (repoName) => {
  const command = new PutImageScanningConfigurationCommand({
    repositoryName: repoName,
    imageScanningConfiguration: {
      scanOnPush: true,
    }
  })
  const response = await ecrClient.send(command);
  return response;
}

const setPolicies = async (repoName, lifecyclePolicy) => {
  await setLifecyclePolicy(repoName, lifecyclePolicy);
  await enableScanning(repoName);
  return;
};

const getRepositories = async () => {
  const params = {maxResults: 100};
  const paginatorConfig = { client: ecrClient, pageSize: 100 };
  const paginator = paginateDescribeRepositories(paginatorConfig, params);
  const repoNames = [];
  for await (const page of paginator) {
    repoNames.push(...page.repositories.map(repo => repo.repositoryName));
  }
  return repoNames;
}

module.exports.setAllHandler = async (event, context) => {
  const respositories = await getRepositories();
  const lifecyclePolicy = await readPolicy("policies/lifecycle.json");
  for (const repo of respositories) {
    const repoName = repo;
    log.info(`Setting policies for ${repoName}`);
    await setPolicies(repoName, lifecyclePolicy);
    log.info(`Policies set for ${repoName}`)
  }
}

module.exports.newRepoEventHandler = async (event, context) => {
  const repoName = event.responseElements?.repository?.repositoryName;
  if (repoName !== undefined) {
    log.info(`Setting policies for ${repoName}`)
    const lifecyclePolicy = await readPolicy("policies/lifecycle.json");
    await setPolicies(repoName, lifecyclePolicy);
    log.info(`Policies set for ${repoName}`)
  } else {
    log.info("No repository name found in event")
    log.info(event)
  }
};
