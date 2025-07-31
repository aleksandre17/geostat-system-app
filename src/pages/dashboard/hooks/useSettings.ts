import { useState, useEffect } from "react";
import { SettingsManager } from "../manager/SettingsManager.ts";
import type { SettingsHookReturn } from "../types";
import { useDataProvider } from "react-admin";
import { SettingsDataProvider } from "../../../providers/settingsDataProvider.ts";
import { MenuItems } from "../../../types/treeCategories";

export const useSettings = <
  T = { data: MenuItems },
>(): SettingsHookReturn<T> => {
  const [settings, setSettings] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const dataProvider = useDataProvider<SettingsDataProvider>();
  console.log("dataProvider", dataProvider);

  useEffect(() => {
    const manager = SettingsManager.getInstance().setDataProvider(dataProvider);
    const currentSettings = manager.getSettings();

    if (currentSettings) {
      setSettings(currentSettings as T);
      setLoading(false);
    }

    const unsubscribe = manager.subscribe((newSettings) => {
      setSettings(newSettings as T);
      setLoading(false);
    });

    if (!currentSettings) {
      manager.loadSettings().catch((err) => {
        setError(err);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, [dataProvider]);

  const updateSettings = async (newSettings: Partial<T>) => {
    try {
      setLoading(true);
      const manager = SettingsManager.getInstance();
      const updatedSettings = await manager.updateSettings(newSettings);
      return updatedSettings as T;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
};
