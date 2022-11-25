const core = require("@actions/core");
const SpeedCurve = require("speedcurve");
const log = require("speedcurve/dist/log");

async function run() {
  if (core.isDebug()) {
    log.setLevel("verbose");
  }

  core.debug(`Using speedcurve@${require("speedcurve/package.json").version}`);

  const apiKey = core.getInput("api_key", { required: true });
  const siteId = core.getInput("site_id");
  const urlId = core.getInput("url_id");
  const replaceOrigin = core.getInput("replace_origin");
  const noteParam = core.getInput("note");
  const detailParam = core.getInput("detail");

  const workflowName = process.env["GITHUB_WORKFLOW"];
  const runNumber = process.env["GITHUB_RUN_NUMBER"];
  const repositoryName = process.env["GITHUB_REPOSITORY"];
  const defaultNote = `Run #${runNumber} of workflow ${workflowName} in ${repositoryName}`;

  const deployNote = noteParam || defaultNote;
  const deployDetail = detailParam || "";

  core.setSecret(apiKey);

  let afterDeploy = async () => {};

  if (replaceOrigin) {
    let replaceOriginUrl;

    try {
      replaceOriginUrl = new URL(replaceOrigin);
    } catch (err) {
      core.setFailed(`replace_origin "${replaceOrigin}" could not be parsed`);
      process.exit(1);
    }

    if (!siteId) {
      core.setFailed("replace_origin can only be used when site_id is specified");
      process.exit(1);
    }

    let site;

    try {
      site = await SpeedCurve.sites.get(apiKey, siteId);
    } catch (err) {
      core.debug(err.message);
      core.setFailed(`Failed to fetch site ${siteId}`);
      process.exit(1);
    }

    core.debug(`Updating URLs in site ${siteId} with origin ${replaceOrigin.origin}`);

    await Promise.all(
      site.urls.map((url) => {
        const parsedUrl = new URL(url.url);
        const newUrl = parsedUrl.href.replace(parsedUrl.origin, replaceOriginUrl.origin);

        core.debug(`Updating URL ${url.urlId} to ${newUrl}`);

        return SpeedCurve.urls.update(apiKey, url.urlId, {
          url: newUrl,
        });
      })
    );

    // Restore the URLs to their original origin after the deploy
    afterDeploy = async () => {
      await Promise.all(
        site.urls.map((url) => {
          core.debug(`Restoring URL ${url.urlId} to ${url.url}`);

          return SpeedCurve.urls.update(apiKey, url.urlId, {
            url: url.url,
          });
        })
      );
    };
  }

  let deployResults;

  if (urlId) {
    core.info(`Creating deploy for URL ${urlId}`);

    deployResults = SpeedCurve.deploys.createForUrls(apiKey, [urlId], {
      note: deployNote,
      detail: deployDetail,
      force: true,
    });

    if (!deployResults.length || !deployResults[0].success) {
      await afterDeploy();

      core.setFailed(`Failed to trigger deploy for URL ${urlId}`);

      if (deployResults.length && deployResults[0].error) {
        core.error(deployResults[0].error);
      }

      process.exit(1);
    }
  } else if (siteId) {
    core.info(`Creating deploy for site ${siteId}`);

    deployResults = await SpeedCurve.deploys.create(apiKey, [siteId], {
      note: deployNote,
      detail: deployDetail,
      force: true,
    });

    if (!deployResults.length || !deployResults[0].success) {
      await afterDeploy();

      core.setFailed(`Failed to trigger deploy for site ${siteId}`);

      if (deployResults.length && deployResults[0].error) {
        core.error(deployResults[0].error);
      }

      process.exit(1);
    }
  } else {
    core.setFailed("Either a siteId or urlId must be provided");
    process.exit(1);
  }

  await afterDeploy();

  core.info(`Deploy ${deployResults[0].deployId} triggered ${deployResults[0].totalTests} tests`);
  core.setOutput("deploy_id", deployResults[0].deployId);
}

run();
