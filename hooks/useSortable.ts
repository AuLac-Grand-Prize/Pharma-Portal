"use client";

import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  dir: SortDir;
}

export function useSortable<T, K extends string>(
  rows: ReadonlyArray<T>,
  initial: SortState<K>,
  accessors: Record<K, (row: T) => string | number>,
) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const sortedRows = useMemo(() => {
    const get = accessors[sort.key];
    if (!get) return [...rows];
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, accessors]);

  function toggle(key: K) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  return { sort, toggle, sortedRows };
}
