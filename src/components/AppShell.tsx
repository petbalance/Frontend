import { useState } from "react";
import { useSession } from "../state/session";
import { useAuth } from "../state/auth";
import { Icon, type IconName } from "./Icon";
import { DietBoard } from "./DietBoard";
import { HandoffImport } from "./HandoffImport";
import { ProfilePanel } from "./ProfilePanel";
import { ProductAddPanel } from "./ProductAddPanel";
import { Notice } from "./ui";
import { DietComparison } from "./DietComparison";
import { CostPanel } from "./CostPanel";

type View = "profile" | "diet" | "analysis" | "products";
const NAV: { id: View; label: string; title: string; icon: IconName }[] = [
  { id: "profile", label: "프로필", title: "반려동물 프로필", icon: "paw" },
  { id: "diet", label: "급여조합", title: "급여조합", icon: "bowl" },
  { id: "analysis", label: "영양소 분석", title: "영양소 분석", icon: "list" },
  { id: "products", label: "제품 추가", title: "제품 추가", icon: "plus" },
];
const VIEW_COPY: Record<View, { eyebrow: string; sub: string }> = {
  profile: { eyebrow: "반려동물 정보", sub: "아이의 기본 정보를 정확하게 관리해요." },
  diet: { eyebrow: "오늘의 식단", sub: "먹이고 있는 제품과 하루 급여량을 한곳에서 정리해요." },
  analysis: { eyebrow: "영양 리포트", sub: "총량과 참고 범위, 확인할 성분을 쉽게 비교해요." },
  products: { eyebrow: "제품 라이브러리", sub: "사료·간식·영양제를 검색하거나 직접 등록해요." },
};
const petbalance = (window as unknown as { petbalance?: {
  isElectron?: boolean; platform?: string;
  win?: { minimize(): void; toggleMaximize(): void; close(): void };
} }).petbalance;

export function AppShell() {
  const [view, setView] = useState<View>("diet");
  const { state } = useSession();
  const { logout } = useAuth();
  const p = state.profile;
  const current = NAV.find((item) => item.id === view)!;
  const copy = VIEW_COPY[view];
  return (
    <div className="appwin">
      <div className={"titlebar" + (petbalance?.platform === "darwin" ? " mac" : "")}>
        <span className="tb-brand"><span className="tb-logo" aria-hidden><Icon name="paw" size={13} /></span>petbalance</span>
        <nav className="desktop-nav no-print" aria-label="주요 메뉴">
          {NAV.map((item) => <button key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}>{item.label}</button>)}
        </nav>
        <span className="tb-spacer" />
        <button className="account-chip no-print" onClick={() => setView("profile")}>
          <span className="account-avatar" aria-hidden>{(p.name || "P").slice(0, 1)}</span>
          <span>{p.name || "우리 아이"}</span>
        </button>
        {petbalance?.isElectron && petbalance.platform !== "darwin" && <div className="win-btns no-print">
          <button aria-label="최소화" onClick={() => petbalance.win?.minimize()}>─</button>
          <button aria-label="최대화" onClick={() => petbalance.win?.toggleMaximize()}>▢</button>
          <button className="close" aria-label="닫기" onClick={() => petbalance.win?.close()}>✕</button>
        </div>}
      </div>
      <div className="appbody">
        <section className="workspace">
          <header className="toolbar">
            <div><span className="toolbar-eyebrow">{copy.eyebrow}</span><h2>{current.title}</h2><p className="tb-sub">{copy.sub}</p></div>
          </header>
          <main className="canvas" key={view}>
            <div className="mobile-pet pet-summary">
              <span className="pet-summary-icon"><Icon name="paw" size={26} /></span>
              <div><strong>{p.name || "우리 아이"}의 건강한 하루</strong><p>{p.age}세 · {(+p.weight).toFixed(1)}kg{p.breed ? ` · ${p.breed}` : ""}</p></div>
              <button className="pet-summary-link no-print" onClick={() => setView("profile")}>정보 수정</button>
            </div>
            {state.loadError && <Notice tone="warn">제품 정보를 불러오지 못했습니다: {state.loadError}</Notice>}
            {view === "profile" && <div className="stack"><HandoffImport /><ProfilePanel /><button className="btn btn-primary" onClick={() => setView("diet")}>급여조합 설정하기</button><button className="btn btn-ghost" onClick={() => logout()}>로그아웃</button></div>}
            {view === "diet" && <div className="stack"><DietBoard mode="diet" onAdd={() => setView("products")} /><button className="btn btn-primary" onClick={() => setView("analysis")}>영양소 분석 보기</button></div>}
            {view === "analysis" && <div className="stack"><DietComparison /><DietBoard mode="analysis" onAdd={() => setView("products")} /><CostPanel /></div>}
            {view === "products" && <ProductAddPanel />}
          </main>
        </section>
      </div>
      <nav className="mobile-tabs no-print" aria-label="주요 메뉴">
        {NAV.map((item) => <button key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}><Icon name={item.icon} size={23} /><span>{item.label}</span></button>)}
      </nav>
    </div>
  );
}

