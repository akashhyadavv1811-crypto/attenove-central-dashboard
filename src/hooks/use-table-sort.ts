import { useState, useCallback } from "react";

export type SortDirection = "asc" | "desc" | null;

/**
 * Shared hook for table column sort state (cycle: none → asc → desc → none).
 * getSortDirection(field) returns the current direction for that column so the UI can show the right icon.
 */
export function useTableSort<T extends string>(initialField: T | null = null, initialDirection: SortDirection = null) {
  const [sortField, setSortField] = useState<T | null>(initialField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const handleSort = useCallback((field: T) => {
    setSortField((prevField) => {
      setSortDirection((prevDir) => {
        if (prevField !== field) return "asc";
        if (prevDir === "asc") return "desc";
        return null;
      });
      if (sortField !== field) return field;
      if (sortDirection === "asc") return field;
      return null;
    });
  }, [sortField, sortDirection]);

  // Sync state: when we're clearing, we need to clear both. The above handleSort toggles direction then field;
  // actually the logic is: click same field -> cycle asc->desc->null (and null means clear field). So when direction becomes null we should set field to null.
  const handleSortStable = useCallback((field: T) => {
    setSortField((prevField) => {
      setSortDirection((prevDir) => {
        if (prevField !== field) return "asc";
        if (prevDir === "asc") return "desc";
        return null;
      });
      if (prevField !== field) return field;
      if (sortDirection === "asc") return field;
      return null;
    });
  }, [sortDirection]);

  // Simpler: single setState that updates both based on previous. React batches so we need one setter.
  const handleSortBatch = useCallback((field: T) => {
    setSortField((prevField) => {
      if (prevField !== field) {
        setSortDirection("asc");
        return field;
      }
      setSortDirection((prevDir) => {
        if (prevDir === "asc") return "desc";
        return null;
      });
      return null; // when clearing direction, clear field too
    });
  }, []);

  // Actually the issue is we have two state vars and we want one click to update both. So we need to compute next state from current. Let me use a single reducer-like update:
  const handleSortFinal = useCallback((field: T) => {
    setSortField((prevField) => {
      if (prevField !== field) {
        setSortDirection("asc");
        return field;
      }
      setSortDirection((prevDir) => {
        if (prevDir === "asc") return "desc";
        return null;
      });
      return null;
    });
  }, []);

  // Problem: setSortDirection is called inside setSortField's updater - so when we "return null" we're setting field to null, but setSortDirection is async. So the next render might have sortDirection still "desc" and sortField null. Let me use a single state object instead.
  const [sort, setSort] = useState<{ field: T | null; direction: SortDirection }>({
    field: initialField,
    direction: initialDirection,
  });

  const handleSortUnified = useCallback((field: T) => {
    setSort((prev) => {
      if (prev.field !== field) return { field, direction: "asc" as const };
      if (prev.direction === "asc") return { field, direction: "desc" as const };
      return { field: null, direction: null };
    });
  }, []);

  const getSortDirection = useCallback(
    (field: T): SortDirection => {
      if (sort.field !== field) return null;
      return sort.direction;
    },
    [sort.field, sort.direction]
  );

  return {
    sortField: sort.field,
    sortDirection: sort.direction,
    setSortField: (f: T | null) => setSort((s) => ({ ...s, field: f })),
    setSortDirection: (d: SortDirection) => setSort((s) => ({ ...s, direction: d })),
    handleSort: handleSortUnified,
    getSortDirection,
  };
}
