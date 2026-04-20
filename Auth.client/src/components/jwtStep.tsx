import { useState } from "react";
import { StepLayout } from "./stepLayout";

const API = "http://localhost:5136/api/v2";

type DecodedToken = {
  header: any;
  payload: any;
};

export function JwtStep() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");

  const [token, setToken] = useState<string>();
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);

  const [noExpToken, setNoExpToken] = useState<string>();
  const [expToken, setExpToken] = useState<string>();

  const [noExpStatus, setNoExpStatus] = useState("");
  const [expStatus, setExpStatus] = useState("");

  // 🔹 Decode JWT
  const decodeFullJwt = (token: string): DecodedToken => {
    const [header, payload] = token.split(".");

    const decode = (part: string) => {
      const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
      return JSON.parse(atob(padded));
    };

    return {
      header: decode(header),
      payload: decode(payload),
    };
  };

  // 🔹 Login (real)
  const handleLogin = async () => {
    const body = JSON.stringify({ email, password }, null, 2);

    setRequest(`POST /api/v2/auth/exp-login\nContent-Type: application/json\n\n${body}`);

    const res = await fetch(`${API}/auth/exp-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json();

    setResponse(`HTTP ${res.status}\n\n${JSON.stringify(data, null, 2)}`);

    setToken(data.token);
    setDecoded(decodeFullJwt(data.token));

    setStep(5);
  };

  // 🔹 Generate tokens for comparison
  const generateTokens = async () => {
    const body = JSON.stringify({ email, password });

    const [noExpRes, expRes] = await Promise.all([
      fetch(`${API}/auth/non-exp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      fetch(`${API}/auth/exp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    ]);

    const noExpData = await noExpRes.json();
    const expData = await expRes.json();

    setNoExpToken(noExpData.token);
    setExpToken(expData.token);
  };

  // 🔹 Call API
  const callProtectedApi = async (
    token: string | undefined,
    setter: (s: string) => void
  ) => {
    if (!token) return;

    const res = await fetch(`${API}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setter(`${res.status} ${res.statusText}`);
  };


  const callNonProtectedApi = async (
    token: string | undefined,
    setter: (s: string) => void
  ) => {
    if (!token) return;

    const res = await fetch(`${API}/auth/protected-no-exp`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setter(`${res.status} ${res.statusText}`);
  };


  return (
    <StepLayout
      title="JWT & HTTPS"
      step={step}
      maxStep={9}
      onNext={() => setStep((s) => s + 1)}
      onBack={() => setStep((s) => s - 1)}
    >

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h3>Problemet</h3>

          <pre className="code-block">
            {`POST /login
{
  "email": "user@test.com",
  "password": "password123"
}`}
          </pre>

          <p>Lösenord skickas över nätverket.</p>
          <p>En angripare kan fånga upp requesten (man-in-the-middle).</p>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3>HTTPS</h3>

          <pre className="code-block">
            {`POST /login 🔒
a8f3k2l9fj2...93jf0as...`}
          </pre>

          <p>HTTPS krypterar trafiken.</p>
          <p>Angriparen ser bara krypterad data.</p>

          <p><strong>Men vi skickar fortfarande lösenordet.</strong></p>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h3>Lösning: Token</h3>

          <p>
            Istället för att skicka lösenordet varje gång,
            kan servern ge oss en token.
          </p>

          <pre className="code-block">
            {`POST /login
→ { "token": "eyJhbGciOi..." }`}
          </pre>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
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

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <h3>Request & Response</h3>

          <pre className="code-block">{request}</pre>
          <pre className="code-block">{response}</pre>
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && decoded && token && (
        <>
          <h3>JWT struktur</h3>

          <pre className="code-block">
            {token.split(".").join("\n")}
          </pre>

          <h4>Header</h4>
          <pre className="code-block">
            {JSON.stringify(decoded.header, null, 2)}
          </pre>

          <h4>Payload</h4>
          <pre className="code-block">
            {JSON.stringify(decoded.payload, null, 2)}
          </pre>

          <p>Header = hur tokenen är signerad</p>
          <p>Payload = information om användaren</p>
          <p>Signature = serverns sätt att verifiera att tokenen inte har ändrats</p>
        </>
      )}

      {/* STEP 7 */}
      {step === 7 && (
        <>
          <h3>Använd token</h3>

          <pre className="code-block">
            {`GET /api/data
Authorization: Bearer eyJhbGciOi...`}
          </pre>

          <p>Servern verifierar token istället för lösenord.</p>
        </>
      )}

      {/* STEP 8 */}
      {step === 8 && (
        <>
          <h3>Problem: Token livslängd</h3>

          <p>Om token inte går ut → farligt.</p>
          <p>Om den stjäls → full access.</p>

          <button onClick={generateTokens}>Generera tokens</button>

          <div className="split">

            <div className="card">
              <h4>Utan expiration ❌</h4>

              <button onClick={() => callNonProtectedApi(noExpToken, setNoExpStatus)}>
                Testa API
              </button>

              <p>{noExpStatus}</p>
              <p>Fungerar för alltid.</p>
            </div>

            <div className="card">
              <h4>Med expiration ✔</h4>

              <button onClick={() => callProtectedApi(expToken, setExpStatus)}>
                Testa API
              </button>

              <p>{expStatus}</p>
              <p>Slutar fungera efter tid.</p>
            </div>

          </div>
        </>
      )}

      {/* STEP 9 */}
      {step === 9 && (
        <>
          <h3>Nytt problem</h3>

          <pre className="code-block">
            401 Unauthorized (token expired)
          </pre>

          <p>Användaren måste logga in igen.</p>

          <p>
            Hur löser vi detta utan att störa användaren?
          </p>

        </>
      )}

    </StepLayout>
  );
}
