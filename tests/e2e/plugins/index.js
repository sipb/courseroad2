/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

// /* eslint-disable import/no-extraneous-dependencies, global-require */
// const webpack = require('@cypress/webpack-preprocessor')

const path = require("path");

const downloadDirectory = path.join(__dirname, "..", "downloads");

const isFirefox = (browser) => browser.family === "firefox";

module.exports = (on, config) => {
  // on('file:preprocessor', webpack({
  //  webpackOptions: require('@vue/cli-service/webpack.config'),
  //  watchOptions: {}
  // }))

  // Download code based on https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/testing-dom__download/cypress/plugins/index.js
  on("task", {
    clearDownloads() {
      console.log("Clearing folder %s", downloadDirectory);
      // fs.rmdirSync(downloadDirectory, { recursive: true });
      return null;
    },
    error(message) {
      console.error("\x1b[31m", "ERROR:", message, "\x1b[0m");
    },
    warn(message) {
      console.warn("\x1b[33m", "WARNING:", message, "\x1b[0m");
    },
  });

  // https://on.cypress.io/browser-launch-api
  on("before:browser:launch", (browser, options) => {
    console.log("browser %o", browser);

    if (isFirefox(browser)) {
      // special settings for Firefox browser
      // to prevent showing popup dialogs that block the rest of the test
      options.preferences["browser.download.dir"] = downloadDirectory;
      options.preferences["browser.download.folderList"] = 2;

      // needed to prevent the download prompt for CSV, Excel, and ZIP files
      // TIP: with Firefox DevTools open, download the file yourself
      // and observe the reported MIME type in the Developer Tools
      const mimeTypes = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
        "application/zip",
      ];

      options.preferences["browser.helperApps.neverAsk.saveToDisk"] =
        mimeTypes.join(",");

      return options;
    }

    // note: we set the download folder in Chrome-based browsers
    // from the spec itself using automation API
  });

  return Object.assign({}, config, {
    fixturesFolder: "tests/e2e/fixtures",
    integrationFolder: "tests/e2e/specs",
    screenshotsFolder: "tests/e2e/screenshots",
    videosFolder: "tests/e2e/videos",
    supportFile: "tests/e2e/support/index.js",
    env: {
      VUE_APP_FIREROAD_URL: process.env.VUE_APP_FIREROAD_URL,
      VUE_APP_URL: process.env.VUE_APP_URL,
    },
  });
};
