import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSortable } from "@/hooks/useSortable";

interface Row {
  name: string;
  price: number;
}

const rows: Row[] = [
  { name: "Beta", price: 30 },
  { name: "Alpha", price: 10 },
  { name: "Gamma", price: 20 },
];

type SortKey = "name" | "price";

const accessors: Record<SortKey, (r: Row) => string | number> = {
  name: (r: Row) => r.name,
  price: (r: Row) => r.price,
};

describe("useSortable", () => {
  it("applies the initial sort order ascending", () => {
    const { result } = renderHook(() =>
      useSortable<Row, SortKey>(rows, { key: "price", dir: "asc" }, accessors),
    );
    expect(result.current.sort).toEqual({ key: "price", dir: "asc" });
    expect(result.current.sortedRows.map((r) => r.price)).toEqual([10, 20, 30]);
  });

  it("flips dir asc → desc when toggling the same key", () => {
    const { result } = renderHook(() =>
      useSortable<Row, SortKey>(rows, { key: "price", dir: "asc" }, accessors),
    );

    act(() => result.current.toggle("price"));

    expect(result.current.sort).toEqual({ key: "price", dir: "desc" });
    expect(result.current.sortedRows.map((r) => r.price)).toEqual([30, 20, 10]);
  });

  it("resets to asc when toggling a new key", () => {
    const { result } = renderHook(() =>
      useSortable<Row, SortKey>(rows, { key: "price", dir: "desc" }, accessors),
    );

    act(() => result.current.toggle("name"));

    expect(result.current.sort).toEqual({ key: "name", dir: "asc" });
    expect(result.current.sortedRows.map((r) => r.name)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ]);
  });
});
