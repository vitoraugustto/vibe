import { defineConfig } from 'cypress';
import registerGrepPlugin from '@cypress/grep/src/plugin.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: false,
    setupNodeEvents(on, config) {
      registerGrepPlugin(config);
      return config;
    },
  },
});
