import { useState } from "react";
import { useAuth } from "../state/auth";
import { getApiBase, setApiBase } from "../api/client";
import { Button, Field, Notice } from "./ui";
import { Icon } from "./Icon";
import "../styles/welcome.css";

export function AuthGate() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [apiBase, setApiBaseInput] = useState(getApiBase());
  const [showApi, setShowApi] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setApiBase(apiBase.trim());
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register(email.trim(), password, name.trim() || undefined);
    } catch (e2) {
      setErr(String((e2 as Error).message || e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap welcome">
      <div className="welcome-layout">
      <section className="welcome-story" aria-labelledby="welcome-title">
        <div className="welcome-brand"><span><Icon name="paw" size={26} /></span>petbalance</div>
        <div className="welcome-intro">
          <p className="welcome-eyebrow">반려동물을 위한 매일의 영양 기록</p>
          <h1 id="welcome-title">잘 먹는 하루,<br /><em>더 오래 함께.</em></h1>
          <p className="welcome-description">사료부터 간식, 영양제까지.<br />우리 아이가 먹는 하루를 한곳에서 살펴보세요.</p>
        </div>
        <div className="welcome-overview">
          <div className="welcome-overview-heading"><Icon name="bowl" size={24} /><span>하루의 식단을 한눈에</span></div>
          <div className="welcome-foods"><span>사료</span><span aria-hidden="true">+</span><span>간식</span><span aria-hidden="true">+</span><span>영양제</span></div>
          <p>따로 먹는 제품도, 영양은 함께 살펴봐야 하니까.</p>
        </div>
        <ol className="welcome-steps" aria-label="petbalance 사용 흐름">
          <li><span>01</span><div><strong>우리 아이 프로필</strong><p>아이의 정보를 담고</p></div></li>
          <li><span>02</span><div><strong>하루 급여조합</strong><p>먹는 제품을 모아</p></div></li>
          <li><span>03</span><div><strong>영양소 분석</strong><p>식단을 살펴보세요</p></div></li>
        </ol>
      </section>
      <form className="auth-card stack welcome-form" onSubmit={submit}>
        <header className="welcome-form-heading">
          <p className="welcome-eyebrow">우리 아이를 알아가는 시간</p>
          <h2>{mode === "login" ? "다시 만나 반가워요" : "첫 기록을 시작해볼까요?"}</h2>
          <p>{mode === "login" ? "로그인하고 우리 아이의 식단을 이어서 관리하세요." : "계정을 만들고 우리 아이의 하루 식단을 모아보세요."}</p>
        </header>

        <div className="chip-toggle" style={{ alignSelf: "flex-start" }}>
          <button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")}>
            로그인
          </button>
          <button
            type="button"
            aria-pressed={mode === "register"}
            onClick={() => setMode("register")}
          >
            회원가입
          </button>
        </div>

        {mode === "register" && (
          <Field label="표시 이름 (선택)">
            <input className="input" aria-label="표시 이름 (선택)" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        )}
        <Field label="이메일">
          <input
            className="input"
            type="email"
            aria-label="이메일"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="비밀번호 (8자 이상)">
          <input
            className="input"
            type="password"
            aria-label="비밀번호 (8자 이상)"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {err && <Notice tone="warn">{err}</Notice>}

        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? "처리 중…" : mode === "login" ? "로그인" : "가입하고 시작"}
        </Button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: "flex-start" }}
          onClick={() => setShowApi((v) => !v)}
        >
          {showApi ? "▾" : "▸"} 서버 주소 설정
        </button>
        {showApi && (
          <Field label="API 서버 URL (비우면 이 앱 내장 서버)">
            <input
              className="input"
              placeholder="예: https://petbalance.example.com"
              aria-label="API 서버 URL (비우면 이 앱 내장 서버)"
              value={apiBase}
              onChange={(e) => setApiBaseInput(e.target.value)}
            />
          </Field>
        )}
        <p className="section-sub">
          계정 데이터는 위 서버에 저장됩니다. 같은 서버 주소를 쓰면 여러 기기에서 같은
          계정으로 접속합니다.
        </p>
      </form>
      </div>
    </div>
  );
}
