import { useState, useCallback } from "react";

/**
 * Shared hook for multi-select status filter (e.g. Active/Inactive chips).
 * allStatuses is typically derived from the list: Array.from(new Set(items.map((i) => i.status))).
 */
export function useStatusFilter(initial: string[] = []): {
  statusFilters: string[];
  setStatusFilters: React.Dispatch<React.SetStateAction<string[]>>;
  toggleStatusFilter: (status: string) => void;
} {
  const [statusFilters, setStatusFilters] = useState<string[]>(initial);

  const toggleStatusFilter = useCallback((status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  return { statusFilters, setStatusFilters, toggleStatusFilter };
}
