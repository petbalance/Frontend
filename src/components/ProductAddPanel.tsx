import { useState } from "react";
import { useSession } from "../state/session";
import { LabelOcrPanel } from "./LabelOcrPanel";
import { Card, Empty } from "./ui";
import { filterProducts } from "../lib/comparison";

export function ProductAddPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const { allProducts, selections, dispatch } = useSession();
  const active = new Set(selections.filter((s) => s.active).map((s) => s.product_id));
  const categories = [...new Set(allProducts.map((p) => p.category))];
  const products = filterProducts(allProducts, query, category);
  return <div className="stack">
    <Card>
      <div className="section-title">등록된 제품 찾기</div>
      <p className="section-sub">사료·간식·영양제를 찾아 급여조합에 추가하세요.</p>
      <input className="input" type="search" aria-label="제품 검색" placeholder="제품명, 브랜드, 분류 검색" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginTop: 12, width: "100%" }} />
      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        <select className="input" aria-label="제품 분류" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">모든 분류</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {(query || category) && <button className="btn btn-ghost" onClick={() => { setQuery(""); setCategory(""); }}>검색 초기화</button>}
        <span className="section-sub" role="status">검색 결과 {products.length}개</span>
      </div>
      <div className="stack" style={{ marginTop: 16 }}>
        {products.length === 0 && <Empty>일치하는 제품이 없습니다. 아래에서 직접 등록할 수 있어요.</Empty>}
        {products.map((p) => <div className="product-add-row" key={p.product_id}>
          <div><strong>{p.name}</strong><p className="section-sub">{p.brand ? `${p.brand} · ` : ""}{p.category}</p></div>
          <button className="btn btn-primary" disabled={active.has(p.product_id)} onClick={() => dispatch({ type: "setActive", id: p.product_id, active: true })}>{active.has(p.product_id) ? "추가됨" : "추가"}</button>
        </div>)}
      </div>
    </Card>
    <LabelOcrPanel />
  </div>;
}
