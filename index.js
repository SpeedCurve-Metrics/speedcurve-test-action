const core = require("@actions/core");
const SpeedCurve = require("speedcurve");

async function run() {
  const apiKey = core.getInput("SPEEDCUVE_API_KEY");
  const siteId = core.getInput("siteId");
  const urlId = core.getInput("urlId");

  core.setSecret(apiKey);

  if (urlId) {
    core.info(`Creating deploy for URL ${urlId}`);

    try {
      await SpeedCurve.deploys.createForUrls(apiKey, [urlId]);
    } catch (e) {
      core.setFailed(`Failed to trigger deploy for URL ${urlId}: ${e.message}`);
    }
  } else if (siteId) {
    core.info(`Creating deploy for site ${siteId}`);

    try {
      await SpeedCurve.deploys.create(apiKey, [siteId]);
    } catch (e) {
      core.setFailed(`Failed to trigger deploy for site ${siteId}: ${e.message}`);
    }
  } else {
    core.setFailed("Either a siteId or urlId must be provided");
  }
}

run();
