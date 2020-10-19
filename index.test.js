const process = require("process");
const cp = require("child_process");
const path = require("path");

test("test runs", () => {
  process.env["GITHUB_WORKFLOW"] = "Test Workflow";
  process.env["GITHUB_RUN_NUMBER"] = "23";
  process.env["GITHUB_REPOSITORY"] = "SpeedCurve-Metrics/test-repo";
  process.env["INPUT_API_KEY"] = "xxxxxxx";
  process.env["INPUT_SITE_ID"] = "1234";
  const ip = path.join(__dirname, "index.js");
  console.log(cp.execSync(`node ${ip}`, { env: process.env }).toString());
});
