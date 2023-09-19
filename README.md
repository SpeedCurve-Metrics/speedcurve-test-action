# SpeedCurve Test GitHub Action

🍩 Run SpeedCurve tests as part of your GitHub workflow.

# Usage

This action requires a [SpeedCurve](https://speedcurve.com/) account and a valid [SpeedCurve API key](https://support.speedcurve.com/docs/rest-api#finding-your-api-key). We recommend that you store your API key as a [GitHub secret](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets).

## Run tests for a single URL

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: SpeedCurve-Metrics/speedcurve-test-action@v1.2.2
    with:
      api_key: ${{ secrets.SPEEDCURVE_API_KEY }}
      url_id:
        123456 # URL IDs can be retrieved from the /v1/sites API endpoint,
        # or by running the list-sites command with speedcurve-cli.
```

## Run tests for an entire site

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: SpeedCurve-Metrics/speedcurve-test-action@v1.2.2
    with:
      api_key: ${{ secrets.SPEEDCURVE_API_KEY }}
      site_id:
        123456 # Site IDs can be retrieved from the /v1/sites API endpoint,
        # or by running the list-sites command with speedcurve-cli.
```

## Run tests against a dynamically-generated deployment URL

This example uses the [Netlify Actions](https://github.com/nwtgck/actions-netlify) action to create a Deploy Preview, and then passes the preview URL to the SpeedCurve action. The SpeedCurve action will update all URLs in the specified site to use the preview origin, trigger a round of testing, and then restore the original URLs.

```yaml
steps:
  - uses: actions/checkout@v2

  - id: netlify-deploy
    uses: nwtgck/actions-netlify@v1.1
    with:
      publish-dir: "./dist"
    env:
      NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
      NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  - uses: SpeedCurve-Metrics/speedcurve-test-action@v1.2.1
    with:
      api_key: ${{ secrets.SPEEDCURVE_API_KEY }}
      site_id: 123456
      replace_origin: ${{ steps.netlify-deploy.outputs.deploy-url }}
```

## Add custom deploy note

The `note` input parameter lets you add a custom message which will be displayed as a run's title on the app's dashboards.

```yaml
steps:
  - uses: actions/checkout@v2

  - uses: SpeedCurve-Metrics/speedcurve-test-action@v1.2.2
    with:
      api_key: ${{ secrets.SPEEDCURVE_API_KEY }}
      site_id: 123456
      note: "#$GITHUB_RUN_NUMBER - New build custom note"
      detail: "You can put more information in the note detail field."
```
