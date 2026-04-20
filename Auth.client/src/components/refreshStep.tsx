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

  const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

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

    setStep(4);
  };

  const callApi = async () => {
    if (!accessToken) return;

    setStatusMessages([]);

    const res = await fetch(`${API}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 200) {
      setStatusMessages(prev => [
        ...prev,
        `${res.status} ${res.statusText}, perfekt! Access tokenen är fortfarande giltig!`,
      ]);
    }

    if (res.status === 401) {
      setStatusMessages(prev => [
        ...prev,
        `${res.status} ${res.statusText}, oh nej! Tokenen har gått ut!`,
      ]);

      await refresh();
    }
  };

  const refresh = async () => {
    await delay(1200);

    setStatusMessages(prev => [
      ...prev,
      "Vi försöker använda refresh token...",
    ]);

    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.status === 200) {
      await delay(1200);

      setStatusMessages(prev => [
        ...prev,
        `${res.status} ${res.statusText}, ny access token skapad ✔`,
      ]);

      const data = await res.json();
      setAccessToken(data.accessToken);
    }

    if (res.status === 401) {
      await delay(1200);

      setStatusMessages(prev => [
        ...prev,
        `${res.status} ${res.statusText}, refresh token ogiltig → logga in igen`,
      ]);
    }
  };

  return (
    <StepLayout
      title="Refresh Token"
      step={step}
      maxStep={6}
      onNext={() => setStep((s) => s + 1)}
      onBack={() => setStep((s) => s - 1)}
    >

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h3>Token har gått ut</h3>

          <pre className="code-block">
            401 Unauthorized
          </pre>

          <p>Access token är inte längre giltig.</p>

          <p>
            Hur kan vi fortsätta utan att logga in igen?
          </p>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3>Lösning: Refresh token</h3>

          <p>Access token → kort liv</p>
          <p>Refresh token → långt liv</p>

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

          <button onClick={handleLogin}>Logga in</button>
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
          <p>Refresh token sparas separat.</p>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <h3>Session i praktiken</h3>

          <button onClick={callApi}>Call API</button>

          {statusMessages.map((sm, i) => (
            <p key={i}>{sm}</p>
          ))}
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <>
          <h3>Nästa steg</h3>

          <p>
            Nu kan vi hålla användaren inloggad på ett säkert sätt.
          </p>

          <p>
            Men… vad får användaren faktiskt göra?
          </p>

          <p>
            Ska alla ha tillgång till all data?
          </p>

          <p>
            <strong>→ Nästa: Auktorisering (roller)</strong>
          </p>
        </>
      )}

    </StepLayout>
  );
}
