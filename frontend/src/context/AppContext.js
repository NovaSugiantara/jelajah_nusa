import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchRegions, fetchProgress, saveProgress } from "../lib/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [regions, setRegions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [reg, prog] = await Promise.all([fetchRegions(), fetchProgress()]);
    setRegions(reg.regions);
    setProgress(prog);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordProgress = useCallback(async (payload) => {
    const data = await saveProgress(payload);
    setProgress((prev) => ({
      ...(prev || {}),
      regions_explored: data.regions_explored,
      regions_completed: data.regions_completed,
      stories: data.stories,
      collectibles: data.collectibles,
      stats: data.stats,
    }));
    return data;
  }, []);

  const statusOf = useCallback(
    (slug) => {
      if (!progress) return "belum";
      if (progress.regions_completed?.includes(slug)) return "selesai";
      if (progress.regions_explored?.includes(slug)) return "berlangsung";
      return "belum";
    },
    [progress]
  );

  return (
    <AppContext.Provider
      value={{ regions, progress, loading, refresh, recordProgress, statusOf }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
