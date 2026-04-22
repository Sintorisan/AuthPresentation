import { useState } from "react";
import { StepLayout } from "./stepLayout";

const API = "http://localhost:5136/api/v3";

export function RefreshStep() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accessToken, setAccessToken] = useState<string>();
  const [refreshToken, setRefreshToken] = useState<string>();

  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // 🔹 Login
  const handleLogin = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    await delay(400);
    next();
  };

  // 🔹 Call API (simulates session flow)
  const callApi = async () => {
    if (!accessToken) return;

    setStatusMessages([]);

    const res = await fetch(`${API}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 200) {
      setStatusMessages((prev) => [
        ...prev,
        `${res.status} ${res.statusText}, access token är fortfarande giltig`,
      ]);
      return;
    }

    if (res.status === 401) {
      setStatusMessages((prev) => [
        ...prev,
        `${res.status} ${res.statusText}, access token har gått ut`,
      ]);

      await handleRefresh();
    }
  };

  // 🔹 Refresh flow
  const handleRefresh = async () => {
    await delay(1000);

    setStatusMessages((prev) => [
      ...prev,
      "Försöker använda refresh token...",
    ]);

    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.status === 200) {
      const data = await res.json();

      await delay(1000);

      setAccessToken(data.accessToken);

      setStatusMessages((prev) => [
        ...prev,
        `${res.status} ${res.statusText}, ny access token skapad`,
        "Försöker igen med ny token...",
      ]);

      await retryWithNewToken(data.accessToken);
      return;
    }

    if (res.status === 401) {
      await delay(1000);

      setStatusMessages((prev) => [
        ...prev,
        `${res.status} ${res.statusText}, refresh token ogiltig`,
        "Användaren måste logga in igen",
      ]);
    }
  };

  const retryWithNewToken = async (newToken: string) => {
    const res = await fetch(`${API}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    });

    setStatusMessages((prev) => [
      ...prev,
      `${res.status} ${res.statusText}, request lyckades`,
    ]);
  };

  return (
    <StepLayout
      title="Refresh Token"
      step={step}
      maxStep={6}
      onNext={next}
      onBack={back}
    >
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Svar på JWT-friktionen</p>
            <h3>Refresh token låter sessionen fortsätta utan nytt lösenord</h3>
            <p>
              Access token får vara kortlivad för säkerhetens skull. När den
              går ut kan klienten använda en refresh token för att få en ny.
            </p>
          </div>

          <pre className="code-block">
            {`401 Unauthorized`}
          </pre>

          <span className="status-badge warning">Access token är inte längre giltig.</span>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="comparison-grid">
            <div className="card success">
              <h4>Access token: kort liv</h4>
              <p>Används i API anrop och begränsar skadan om den läcker.</p>
            </div>

            <div className="card success">
              <h4>Refresh token: längre liv</h4>
              <p>Används bara för att hämta en ny access token.</p>
            </div>
          </div>

          <div className="flow-row">
            <span className="flow-step">401</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Refresh token</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Ny access token</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Request försöks igen</span>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Demo</p>
            <h3>Logga in och hämta båda token-typerna</h3>
            <p>Responsen innehåller både access token och refresh token.</p>
          </div>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Lösenord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={!email || !password}>
            Logga in
          </button>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <div className="takeaway-block">
            <p className="eyebrow">Två roller i sessionen</p>
            <h3>En token för API-anrop, en token för förnyelse</h3>
          </div>

          <pre className="code-block">
            {`{
  "accessToken": "${accessToken?.slice(0, 30)}...",
  "refreshToken": "${refreshToken?.slice(0, 30)}..."
}`}
          </pre>

          <div className="badge-row">
            <span className="status-badge protected">Access token används i API calls</span>
            <span className="status-badge protected">Refresh token hämtar ny access token</span>
          </div>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Demo</p>
            <h3>Session i praktiken</h3>
            <p>
              Testa flödet: först försöker vi med access token, sedan refreshar
              vi om servern svarar 401.
            </p>
          </div>

          <button onClick={callApi}>
            Call API
          </button>

          <div className="timeline">
            {statusMessages.map((msg, i) => (
              <div className="timeline-item" key={i}>
                <span className="timeline-dot">{i + 1}</span>
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <>
          <div className="transition-block">
            <p className="eyebrow">Handoff</p>
            <h3>Nu är identiteten stabil, men behörigheten är fortfarande öppen.</h3>
            <p>
              Vi vet vem användaren är och kan hålla sessionen vid liv. Nästa
              fråga är vad just den användaren faktiskt får göra.
            </p>
          </div>

          <div className="badge-row">
            <span className="status-badge protected">Inloggad utan nytt lösenord</span>
            <span className="status-badge warning">Olika användare behöver olika access</span>
          </div>
        </>
      )}
    </StepLayout>
  );
}
