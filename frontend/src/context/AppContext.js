import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchRegions, fetchProgress } from "../lib/api";

const AppContext = createContext(null);

const STATUS_MAP = { completed: "selesai", in_progress: "berlangsung", not_started: "belum" };

export function AppProvider({ children }) {
  const [regions, setRegions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [reg, prog] = await Promise.all([fetchRegions(), fetchProgress()]);
      setRegions(reg.regions);
      setProgress(prog);
      setError("");
    } catch (e) {
      setError("Gagal memuat aplikasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const statusOf = useCallback(
    (slug) => {
      const status = progress?.provinces?.[slug]?.status;
      return STATUS_MAP[status] || "belum";
    },
    [progress]
  );

  const provinceProgress = useCallback(
    (slug) => progress?.provinces?.[slug] || null,
    [progress]
  );

  return (
    <AppContext.Provider value={{ regions, progress, loading, error, refresh, statusOf, provinceProgress }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
