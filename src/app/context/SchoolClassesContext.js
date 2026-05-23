"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_CLASS_CONFIG } from "@/lib/classConfig";
import { fetchSchoolClasses } from "@/lib/schoolClassesClient";

const SchoolClassesContext = createContext({
  classConfig: DEFAULT_CLASS_CONFIG,
  classSlugs: Object.keys(DEFAULT_CLASS_CONFIG),
  loading: true,
  refresh: async () => {},
});

export function SchoolClassesProvider({ children }) {
  const [classConfig, setClassConfig] = useState(DEFAULT_CLASS_CONFIG);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const config = await fetchSchoolClasses();
      setClassConfig(config);
    } catch {
      setClassConfig(DEFAULT_CLASS_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const classSlugs = useMemo(() => Object.keys(classConfig), [classConfig]);

  const value = useMemo(
    () => ({ classConfig, classSlugs, loading, refresh }),
    [classConfig, classSlugs, loading, refresh],
  );

  return (
    <SchoolClassesContext.Provider value={value}>
      {children}
    </SchoolClassesContext.Provider>
  );
}

export function useSchoolClasses() {
  return useContext(SchoolClassesContext);
}
