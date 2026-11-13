import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    apiURL: "http://localhost:8080",
  },
  e2e: {
    baseUrl: "http://localhost:4200",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
