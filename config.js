/* eslint import/extensions: 0 */
import packageJson from "./package.json";

export default () => ({
  libraryRepoUrl: "https://github.com/inrupt/solid-client-notifications-js",
  demoRepoUrl: packageJson.repository.url,
  copyright: "Copyright 2021 Inrupt, Inc.",
  demoTitle: "solid-client-notifications-js Demo",
  demoDescription: "A demo using solid-client-notifications-js to watch for resource changes",
});
