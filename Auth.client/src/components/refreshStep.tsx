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
          <h3>Token har gått ut</h3>

          <pre className="code-block">
            {`401 Unauthorized`}
          </pre>

          <p>Access token är inte längre giltig.</p>

          <p>
            Måste användaren logga in igen varje gång detta händer?
          </p>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3>Lösning: Refresh token</h3>

          <p>Access token → kort liv</p>
          <p>Refresh token → längre liv</p>

          <p>
            Refresh token används för att hämta en ny access token.
          </p>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h3>Logga in</h3>

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
          <h3>Login response</h3>

          <pre className="code-block">
            {`{
  "accessToken": "${accessToken?.slice(0, 30)}...",
  "refreshToken": "${refreshToken?.slice(0, 30)}..."
}`}
          </pre>

          <p>Access token används i API calls.</p>
          <p>Refresh token används för att hämta en ny access token.</p>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <h3>Session i praktiken</h3>

          <button onClick={callApi}>
            Call API
          </button>

          {statusMessages.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <>
          <h3>Nästa steg</h3>

          <p>
            Användaren hålls inloggad utan att skriva in lösenord igen.
          </p>

          <p>
            Men alla användare ska inte ha samma tillgång.
          </p>

          <p>
            Hur styr vi vad en användare får göra?
          </p>
        </>
      )}
    </StepLayout>
  );
}
