import { defineConfig } from 'cypress';
import registerGrepPlugin from '@cypress/grep/src/plugin.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: false,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/mochawesome',
      overwrite: false,
      html: true,
      json: false,
      inlineAssets: true
    },
    setupNodeEvents(on, config) {
      registerGrepPlugin(config);
      return config;
    },
  },
});
