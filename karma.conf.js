// Karma settings for `ng test`: headless Chromium without sandbox so it also runs in CI containers.
module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: { jasmine: { random: true }, clearContext: false },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/chambita-web-app'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] },
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    restartOnFileChange: true,
  });
};
