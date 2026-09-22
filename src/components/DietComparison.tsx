import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { AnalyzeResponse, Product, Selection } from "../api/types";
import { useSession } from "../state/session";
import { compareNutrients, excludeProduct } from "../lib/comparison";
import { costRows } from "../lib/calc";
import { mg, won } from "../lib/format";
import { Empty, Notice, Section } from "./ui";

export function DietComparison() {
  const { allProducts, selections } = useSession();
  const [excludedId, setExcludedId] = useState("");
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; before?: AnalyzeResponse; after?: AnalyzeResponse; error?: string } | null>(null);
  const active = allProducts.filter((p) => selections.some((s) => s.product_id === p.product_id && s.active));
  const selected = active.find((p) => p.product_id === excludedId);
  const key = selected ? JSON.stringify({ products: allProducts, selections, id: selected.product_id }) : "";

  useEffect(() => {
    if (!key) return;
    let current = true;
    setResult(null);
    const snapshot = JSON.parse(key) as { products: Product[]; selections: Selection[]; id: string };
    const timer = window.setTimeout(() => {
      Promise.all([
        api.analyze(snapshot.products, snapshot.selections),
        api.analyze(snapshot.products, excludeProduct(snapshot.selections, snapshot.id)),
      ]).then(([before, after]) => {
        if (current) setResult({ key, before, after });
      }).catch((error: unknown) => {
        if (current) setResult({ key, error: error instanceof Error ? error.message : "분석 요청에 실패했습니다." });
      });
    }, 250);
    return () => { current = false; window.clearTimeout(timer); };
  }, [key, retry]);

  const visible = result?.key === key ? result : null;
  const rows = visible?.before && visible.after ? compareNutrients(visible.before.summary, visible.after.summary) : [];
  const costs = costRows(allProducts, selections);
  const afterCosts = costRows(allProducts, excludeProduct(selections, excludedId));
  const beforeCost = costs.reduce((sum, row) => sum + row.monthly_cost, 0);
  const afterCost = afterCosts.reduce((sum, row) => sum + row.monthly_cost, 0);
  const missingPrices = active.filter((p) => !costs.some((row) => row.product_id === p.product_id) && selections.some((s) => s.product_id === p.product_id && s.daily_amount_g > 0));

  return <Section title="제품을 빼면 어떻게 달라질까요?" sub="현재 식단은 유지하고, 선택한 제품 하나를 제외한 결과를 비교합니다.">
    {active.length === 0 ? <Empty>급여조합에 제품을 추가하면 비교할 수 있어요.</Empty> : <div className="stack">
      <select className="input" aria-label="비교에서 제외할 제품" value={selected?.product_id ?? ""} onChange={(e) => setExcludedId(e.target.value)}>
        <option value="">제외할 제품 선택…</option>
        {active.map((p) => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
      </select>
      {selected && <>
        <div className="card card-pad" style={{ background: "var(--brand-wash)" }}>
          <strong>월 예상 비용 · 등록 가격 기준</strong>
          <p style={{ marginTop: 8 }}>{won(beforeCost)} → {won(afterCost)}</p>
          <p className="section-sub">제외 시 월 {won(beforeCost - afterCost)} 감소 · 30일 기준, 데모 가격</p>
          {missingPrices.length > 0 && <p className="section-sub">가격 미등록 또는 계산 불가 제품 {missingPrices.length}개는 합계에서 빠져 있어 실제 총비용과 다를 수 있습니다.</p>}
        </div>
        {!visible && <p role="status">제외 전후 영양소를 계산하고 있어요…</p>}
        {visible?.error && <Notice tone="warn">비교 실패: {visible.error} <button className="btn btn-sm" onClick={() => setRetry((value) => value + 1)}>다시 계산</button></Notice>}
        {visible?.before && visible.after && <>
          <p className="section-sub">{selected.name} 제외 전 → 제외 후. 미표기·누락 값은 0으로 간주하지 않습니다.</p>
          {rows.length === 0 && <Empty>비교할 영양소 정보가 없습니다.</Empty>}
          {rows.map((row) => <div key={row.nutrient} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <strong>{row.nutrient}</strong>
            <p>{row.before?.data_complete ? `${mg(row.before.total_mg)} mg` : "정보 부족"} → {row.after?.data_complete ? `${mg(row.after.total_mg)} mg` : "정보 부족"}</p>
            <p className="section-sub">{row.before?.status ?? "정보 없음"} → {row.after?.status ?? "정보 없음"}{row.delta !== null ? ` · 변화 ${row.delta > 0 ? "+" : ""}${mg(row.delta)} mg` : " · 변동량 산정 불가"}</p>
          </div>)}
        </>}
      </>}
    </div>}
  </Section>;
}
