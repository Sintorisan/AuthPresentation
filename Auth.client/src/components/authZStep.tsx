import { useState } from "react";
import { StepLayout } from "./stepLayout";

const API = "http://localhost:5136/api/v4";

type JwtPayload = {
  email?: string;
  role?: string;
  [key: string]: unknown;
};

export function AuthZStep() {
  const [step, setStep] = useState(1);

  // 🔹 User credentials
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // 🔹 Admin credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // 🔹 Tokens
  const [userToken, setUserToken] = useState<string>();
  const [adminToken, setAdminToken] = useState<string>();

  // 🔹 Decoded payload
  const [userPayload, setUserPayload] = useState<JwtPayload | null>(null);
  const [adminPayload, setAdminPayload] = useState<JwtPayload | null>(null);

  // 🔹 API status
  const [userStatus, setUserStatus] = useState<string[]>([]);
  const [adminStatus, setAdminStatus] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // 🔹 Decode JWT (payload only)
  const decodePayload = (token: string): JwtPayload => {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
    return JSON.parse(atob(padded));
  };

  const login = async (
    email: string,
    password: string,
    setToken: (t: string) => void,
    setPayload: (p: JwtPayload) => void
  ) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("data: ", data.accessToken);

    setToken(data.accessToken);
    setPayload(decodePayload(data.accessToken));
  };

  const callApi = async (
    token: string | undefined,
    endpoint: string,
    setter: (fn: (prev: string[]) => string[]) => void
  ) => {
    if (!token) return;

    const res = await fetch(`${API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setter((prev) => [...prev, `${endpoint} → ${res.status} ${res.statusText}`]);
  };

  return (
    <StepLayout
      title="Authorization (Roles)"
      step={step}
      maxStep={6}
      onNext={next}
      onBack={back}
    >
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Svar på permissions-frågan</p>
            <h3>Auktorisering avgör vad den inloggade användaren får göra</h3>
            <p>
              Autentisering säger vem användaren är. Auktorisering säger vilka
              resurser den identiteten faktiskt får använda.
            </p>
          </div>

          <div className="comparison-grid">
            <div className="card danger">
              <h4>Problem: utan roller</h4>
              <p>En vanlig user riskerar att få tillgång till känslig admin-data.</p>
            </div>

            <div className="card success">
              <h4>Lösning: access per användartyp</h4>
              <p>Servern kan neka requests även när användaren är inloggad.</p>
            </div>
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="takeaway-block">
            <p className="eyebrow">Princip</p>
            <h3>Rollen följer med i tokenen och kontrolleras på backend</h3>
            <p>
              Klienten visar tokenen, men servern bestämmer. Det är backend som
              avgör om rollen får nå endpointen.
            </p>
          </div>

          <div className="flow-row">
            <span className="flow-step">User</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Begränsad access</span>
            <span className="flow-arrow">|</span>
            <span className="flow-step">Admin</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Full access</span>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Demo</p>
            <h3>Logga in som två olika roller</h3>
            <p>Payloaden visar vilken roll servern har lagt i tokenen.</p>
          </div>

          <div className="split">
          {/* USER */}
          <div className="card">
            <h4>User: begränsad användare</h4>

            {!userToken ? (
              <>
                <input
                  placeholder="Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />

                <input
                  placeholder="Lösenord"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />

                <button
                  onClick={() =>
                    login(userEmail, userPassword, setUserToken, setUserPayload)
                  }
                  disabled={!userEmail || !userPassword}
                >
                  Logga in
                </button>
              </>
            ) : (
              <>
                <span className="status-badge success">Inloggad</span>

                <pre className="code-block">
                  {JSON.stringify(userPayload, null, 2)}
                </pre>
              </>
            )}
          </div>

          {/* ADMIN */}
          <div className="card">
            <h4>Admin: privilegierad användare</h4>

            {!adminToken ? (
              <>
                <input
                  placeholder="Email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />

                <input
                  placeholder="Lösenord"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <button
                  onClick={() =>
                    login(adminEmail, adminPassword, setAdminToken, setAdminPayload)
                  }
                  disabled={!adminEmail || !adminPassword}
                >
                  Logga in
                </button>
              </>
            ) : (
              <>
                <span className="status-badge success">Inloggad</span>

                <pre className="code-block">
                  {JSON.stringify(adminPayload, null, 2)}
                </pre>
              </>
            )}
          </div>
          </div>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <div className="demo-block">
            <p className="eyebrow">Access test</p>
            <h3>Samma endpoints, olika resultat beroende på roll</h3>
          </div>

          <div className="split">
          {/* USER */}
          <div className="card">
            <h4>User token</h4>

            <button onClick={() => callApi(userToken, "/auth/public", setUserStatus)}>
              Public data
            </button>

            <button onClick={() => callApi(userToken, "/auth/user", setUserStatus)}>
              User data
            </button>

            <button onClick={() => callApi(userToken, "/auth/admin", setUserStatus)}>
              Admin data
            </button>

            {userStatus.map((s, i) => (
              <span className="status-badge" key={i}>{s}</span>
            ))}
          </div>

          {/* ADMIN */}
          <div className="card">
            <h4>Admin token</h4>

            <button onClick={() => callApi(adminToken, "/auth/public", setAdminStatus)}>
              Public data
            </button>

            <button onClick={() => callApi(adminToken, "/auth/user", setAdminStatus)}>
              User data
            </button>

            <button onClick={() => callApi(adminToken, "/auth/admin", setAdminStatus)}>
              Admin data
            </button>

            {adminStatus.map((s, i) => (
              <span className="status-badge" key={i}>{s}</span>
            ))}
          </div>
          </div>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <div className="takeaway-block">
            <p className="eyebrow">Varför det spelar roll</p>
            <h3>Roller gör att samma system kan vara öppet och skyddat samtidigt</h3>
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <h4>Skyddar data</h4>
              <p>Känsliga endpoints kan kräva högre behörighet.</p>
            </div>
            <div className="mini-card">
              <h4>Begränsar access</h4>
              <p>En användare får bara resurser som matchar rollen.</p>
            </div>
            <div className="mini-card">
              <h4>Stödjer ansvar</h4>
              <p>Olika användartyper kan ha olika uppgifter i systemet.</p>
            </div>
          </div>
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <>
          <div className="transition-block">
            <p className="eyebrow">Handoff</p>
            <h3>Auth och authz fungerar, men hotbilden är större än själva flödet.</h3>
            <p>
              Nu vet vi vem användaren är och vad användaren får göra. Nästa
              steg är att se vilka attacker lagren skyddar mot och var mer skydd behövs.
            </p>
          </div>

          <div className="badge-row">
            <span className="status-badge protected">Autentisering</span>
            <span className="status-badge protected">Session</span>
            <span className="status-badge protected">Auktorisering</span>
          </div>
        </>
      )}
    </StepLayout>
  );
}
