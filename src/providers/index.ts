import { DataProvider } from "react-admin";
import { springDataProvider } from "./springDataProvider";
import { settingsDataProvider } from "./settingsDataProvider";
import { dashboardDataProvider } from "./dashbaordDataProvider.ts";
import { userDataProvider } from "./userDataProvider.ts";
import { pagesDataProvider } from "./pagesDataProvider";

// Default provider to use while the real ones are loading
const defaultDataProvider: DataProvider = {
  getList: () => Promise.reject("Not initialized"),
  getOne: () => Promise.reject("Not initialized"),
  getMany: () => Promise.reject("Not initialized"),
  getManyReference: () => Promise.reject("Not initialized"),
  create: () => Promise.reject("Not initialized"),
  update: () => Promise.reject("Not initialized"),
  updateMany: () => Promise.reject("Not initialized"),
  delete: () => Promise.reject("Not initialized"),
  deleteMany: () => Promise.reject("Not initialized"),
};

const globalSettings: any = null;

// Provider mapping configuration
interface ProviderConfig {
  resources: string[];
  provider: DataProvider | Promise<DataProvider>;
}

// Initialize providers
const providerConfigs: ProviderConfig[] = [
  {
    resources: ["settings"],
    provider: Promise.resolve(settingsDataProvider),
  },
  {
    resources: ["dashboard"],
    provider: Promise.resolve(dashboardDataProvider),
  },
  {
    resources: ["users", "roles", "permissions"],
    provider: Promise.resolve(userDataProvider),
  },
  {
    resources: ["pages"],
    provider: Promise.resolve(pagesDataProvider),
  },
  {
    // Default provider for all other resources
    resources: ["*"],
    provider: Promise.resolve(springDataProvider),
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDataProvider = async (_type: string) => {
  return await Promise.all(
    providerConfigs.map(async (config) => ({
      ...config,
      provider: await config.provider,
    })),
  );
};

export const useGlobalSettings = () => globalSettings;

export default () => {
  const dataProviderPromise = getDataProvider("");
  return new Proxy(defaultDataProvider, {
    get(_, name) {
      if (name === "then") {
        return;
      }

      return async (resource: string, params: never) => {
        const providers = await dataProviderPromise;
        // Find the appropriate provider for this resource
        const providerConfig = providers.find(
          (config) =>
            config.resources.includes(resource) ||
            config.resources.includes("*"),
        );

        if (!providerConfig) {
          throw new Error(`No provider configured for resource: ${resource}`);
        }

        const method = name.toString() as keyof DataProvider;
        return providerConfig.provider[method](resource, params);
      };
    },
  });
};
