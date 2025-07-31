import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import {
  SettingsManager,
  SettingsData,
} from "../pages/dashboard/manager/SettingsManager";
import { SettingsDataProvider } from "../providers/settingsDataProvider.ts";

interface SettingsContextType {
  settings: SettingsData | null;
  setSettings: (settings: SettingsData | null) => void;
  reloadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SettingsData>) => Promise<void>;
  error: Error | null;
  loading: boolean;
  setError: (error: Error | null) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({
  children,
  dataProvider,
}: {
  children: ReactNode;
  dataProvider: SettingsDataProvider;
}) => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const manager = SettingsManager.getInstance().setDataProvider(dataProvider);

    console.log("Initializing settings with dataProvider:");
    setLoading(true);
    manager
      .loadSettings()
      .then(() => {
        setLoading(false);
        //console.log("Settings initialized:", data);
        //setSettings(manager.getSettings() as SettingsData);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to initialize settings"),
        );
      });

    const unsubscribe = manager.subscribe((settings) => {
      setSettings(settings);
    });
    return () => {
      unsubscribe();
    };
  }, [dataProvider]);

  const reloadSettings = useCallback(async () => {
    const manager = SettingsManager.getInstance().setDataProvider(dataProvider);
    try {
      setError(null);
      await manager.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to reload settings"),
      );
    } finally {
      setLoading(false);
    }
  }, [dataProvider]);

  const updateSettings = useCallback(
    async (newSettings: Partial<SettingsData>) => {
      const manager =
        SettingsManager.getInstance().setDataProvider(dataProvider);
      try {
        setError(null);
        await manager.updateSettings(newSettings);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update settings"),
        );
      } finally {
        setLoading(false);
      }
    },
    [dataProvider],
  );

  const contextValue = useMemo(
    () => ({
      settings,
      setSettings,
      reloadSettings,
      updateSettings,
      error,
      loading,
      setError,
    }),
    [settings, reloadSettings, updateSettings, error, loading],
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};
