/* eslint import/extensions: 0 */
import packageJson from "./package.json";

export default () => ({
  libraryRepoUrl: packageJson.repository.url,
  demoRepoUrl: packageJson.repository.url,
  copyright: "Copyright 2021 Inrupt, Inc.",
  demoTitle: "solid-client-notifications-js Demo",
  demoDescription: "A demo using solid-client-notifications-js to watch for resource changes",
});
