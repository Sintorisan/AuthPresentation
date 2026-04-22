import { useState } from "react";
import { StepLayout } from "./stepLayout";

const API = "http://localhost:5136/api/v2";

type JwtHeader = {
  alg: string;
  typ: string;
};

type JwtPayload = {
  email?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

type DecodedToken = {
  header: JwtHeader;
  payload: JwtPayload;
};

export function JwtStep() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [requestBody, setRequestBody] = useState("");
  const [responseBody, setResponseBody] = useState("");

  const [token, setToken] = useState<string>();
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);

  const [noExpToken, setNoExpToken] = useState<string>();
  const [expToken, setExpToken] = useState<string>();

  const [noExpStatus, setNoExpStatus] = useState("");
  const [expStatus, setExpStatus] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, 9));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // 🔹 Decode JWT
  const decodeJwt = (token: string): DecodedToken => {
    const [header, payload] = token.split(".");

    const decodePart = (part: string) => {
      const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
      return JSON.parse(atob(padded));
    };

    return {
      header: decodePart(header),
      payload: decodePart(payload),
    };
  };

  // 🔹 Login
  const handleLogin = async () => {
    const body = JSON.stringify({ email, password }, null, 2);
    setRequestBody(body);

    const res = await fetch(`${API}/auth/exp-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json();

    setResponseBody(JSON.stringify(data, null, 2));
    setToken(data.token);
    setDecoded(decodeJwt(data.token));

    await new Promise((r) => setTimeout(r, 400));
    next();
  };

  // 🔹 Generate tokens (exp vs no exp)
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
  const callApiWithExpiration = async (token: string | undefined, setter: (s: string) => void) => {
    if (!token) return;

    const res = await fetch(`${API}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setter(`${res.status} ${res.statusText}`);
  };

  const callApiWithoutExpiration = async (token: string | undefined, setter: (s: string) => void) => {
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
      onNext={next}
      onBack={back}
    >
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Svar på förra steget</p>
            <h3>Token blir beviset på att användaren redan är verifierad</h3>
            <p>
              Lösenordet ska bara behövas vid login. Efter det vill vi skicka ett bevis
              som servern kan verifiera utan att lösenordet följer med varje gång.
            </p>
          </div>

          <pre className="code-block">
            {`POST /login
{
  "email": "user@test.com",
  "password": "password123"
}`}
          </pre>

          <div className="problem-block">
            <p>Om lösenordet återanvänds som identitetsbevis blir varje request känslig.</p>
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Transportskydd</p>
            <h3>HTTPS skyddar resan mellan klient och server</h3>
            <p>
              Kryptering gör att någon på nätverket inte kan läsa innehållet i
              requesten. Det löser avlyssning, men inte sessiondesignen.
            </p>
          </div>

          <pre className="code-block">
            {`POST /login 🔒
a8f3k2l9fj2...93jf0as...`}
          </pre>

          <span className="status-badge warning">Men lösenordet skickas fortfarande varje gång.</span>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Sessionbevis</p>
            <h3>Servern utfärdar en token efter lyckad login</h3>
            <p>
              Tokenen blir ett signerat kvitto. Klienten kan visa den i
              kommande requests och servern kan verifiera att den är äkta.
            </p>
          </div>

          <pre className="code-block">
            {`POST /login
→ { "token": "eyJhbGciOi..." }`}
          </pre>

          <div className="flow-row">
            <span className="flow-step">Login</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Server verifierar</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Token skapas</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Token används</span>
          </div>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Demo</p>
            <h3>Logga in och hämta en JWT</h3>
            <p>Den här endpointen svarar med en token som innehåller identitetsdata.</p>
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

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Utbyte</p>
            <h3>Requesten skickar credentials, responsen skickar token</h3>
          </div>

          <pre className="code-block">
            {`POST /api/v2/auth/exp-login
Content-Type: application/json

${requestBody}`}
          </pre>

          <pre className="code-block">
            {responseBody}
          </pre>
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && decoded && token && (
        <>
          <div className="takeaway-block">
            <p className="eyebrow">Inuti tokenen</p>
            <h3>JWT består av header, payload och signature</h3>
            <p>
              Payload berättar vem användaren är. Signaturen gör att servern
              kan upptäcka om tokenen har ändrats.
            </p>
          </div>

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
        </>
      )}

      {/* STEP 7 */}
      {step === 7 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Resultat</p>
            <h3>Nu skickas token istället för lösenord</h3>
            <p>
              Servern verifierar tokenen och kan hantera requesten utan att
              användaren behöver skriva in lösenordet igen.
            </p>
          </div>

          <pre className="code-block">
            {`GET /api/data
Authorization: Bearer eyJhbGciOi...`}
          </pre>
        </>
      )}

      {/* STEP 8 */}
      {step === 8 && (
        <>
          <div className="problem-block">
            <p className="eyebrow">Ny tradeoff</p>
            <h3>En token måste också ha en livslängd</h3>
            <p>
              Om en token aldrig går ut och blir stulen kan den användas för
              alltid. Kort livslängd begränsar skadan.
            </p>
          </div>

          <button onClick={generateTokens}>
            Generera tokens
          </button>

          <div className="split">
            <div className="card danger">
              <h4>Problem: ingen expiration</h4>

              <button onClick={() => callApiWithoutExpiration(noExpToken, setNoExpStatus)}>
                Testa API
              </button>

              <p>{noExpStatus}</p>
              <p>En stulen token fortsätter fungera.</p>
            </div>

            <div className="card success">
              <h4>Lösning: med expiration</h4>

              <button onClick={() => callApiWithExpiration(expToken, setExpStatus)}>
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
          <div className="transition-block">
            <p className="eyebrow">Handoff</p>
            <h3>Kortlivade tokens skyddar oss, men skapar friktion.</h3>
            <p>
              När access token går ut får användaren logga in igen.
              Nästa lager löser sessionen utan att göra tokenen farligt långlivad.
            </p>
          </div>

          <pre className="code-block">
            401 Unauthorized (token expired)
          </pre>
        </>
      )}
    </StepLayout>
  );
}
