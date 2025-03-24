import type { Config } from 'jest'
import globalConfig from "./jest.config"

const config: Config = {
  ...globalConfig,
  setupFilesAfterEnv: ["./jest.setup.component.ts"]
};

export default config
