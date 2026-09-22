import type { Product, Selection, SummaryRow } from "../api/types";

export function filterProducts(products: Product[], query: string, category: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return products.filter((p) => {
    const text = `${p.name} ${p.brand ?? ""} ${p.category}`.toLocaleLowerCase();
    return (!category || p.category === category) && words.every((word) => text.includes(word));
  });
}

export function excludeProduct(selections: Selection[], id: string): Selection[] {
  return selections.map((s) => s.product_id === id ? { ...s, active: false } : { ...s });
}

export function compareNutrients(before: SummaryRow[], after: SummaryRow[]) {
  const left = new Map(before.map((row) => [row.nutrient, row]));
  const right = new Map(after.map((row) => [row.nutrient, row]));
  return [...new Set([...left.keys(), ...right.keys()])].map((nutrient) => {
    const a = left.get(nutrient);
    const b = right.get(nutrient);
    const complete = !!a?.data_complete && !!b?.data_complete;
    const delta = complete ? b!.total_mg - a!.total_mg : null;
    return { nutrient, before: a, after: b, delta };
  });
}
