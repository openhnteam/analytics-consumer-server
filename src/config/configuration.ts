import { deepmerge } from "deepmerge-ts";
import defaultConfig from "./config.default";
import developmentConfig from "./config.development";
import testConfig from "./config.test";
import prodConfig from "./config.prd";
import dockerConfig from "./config.docker";

const configs = {
  development: developmentConfig,
  test: testConfig,
  prod: prodConfig,
  docker: dockerConfig
};
const env = process.env.NODE_ENV || "development";

console.log("NODE_ENV", env);

export default () => {
  const envConfig = configs[env];
  const result = deepmerge(defaultConfig, envConfig);
  return result as Record<string, any>;
};
