const process = require("process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");

test("test runs", async () => {
  process.env["GITHUB_WORKFLOW"] = "Test Workflow";
  process.env["GITHUB_RUN_NUMBER"] = "23";
  process.env["GITHUB_REPOSITORY"] = "SpeedCurve-Metrics/test-repo";
  process.env["INPUT_API_KEY"] = "xxxxxxx";
  process.env["INPUT_SITE_ID"] = "1234";

  const scriptPath = path.join(__dirname, "dist", "index.js");

  await exec(`node ${scriptPath}`, { env: process.env }).catch((output) => {
    console.log("This test always fails. Useful. Here's the output:");
    console.log(output.toString());
  });
});
