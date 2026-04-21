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
          <h3>Problemet</h3>

          <p>Alla användare är inloggade.</p>
          <p>Men alla får tillgång till känslig data.</p>

          <p>
            <strong>Alla behandlas likadant → inte säkert</strong>
          </p>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3>Lösning: Roller</h3>

          <p>Vi ger varje användare en roll.</p>

          <p>User → begränsad access</p>
          <p>Admin → full access</p>

          <p>Rollen lagras i token.</p>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="split">
          {/* USER */}
          <div className="card">
            <h4>User</h4>

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
                <p>Inloggad ✔</p>

                <pre className="code-block">
                  {JSON.stringify(userPayload, null, 2)}
                </pre>
              </>
            )}
          </div>

          {/* ADMIN */}
          <div className="card">
            <h4>Admin</h4>

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
                <p>Inloggad ✔</p>

                <pre className="code-block">
                  {JSON.stringify(adminPayload, null, 2)}
                </pre>
              </>
            )}
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="split">
          {/* USER */}
          <div className="card">
            <h4>User</h4>

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
              <p key={i}>{s}</p>
            ))}
          </div>

          {/* ADMIN */}
          <div className="card">
            <h4>Admin</h4>

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
              <p key={i}>{s}</p>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <h3>Varför roller?</h3>

          <p>✔ Skyddar känslig data</p>
          <p>✔ Begränsar åtkomst</p>
          <p>✔ Stödjer olika användartyper</p>
        </>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <>
          <h3>Nästa steg</h3>

          <p>Nu vet vi:</p>
          <p>- vem användaren är</p>
          <p>- vad användaren får göra</p>

          <p>
            Hur skyddar vi systemet från attacker?
          </p>
        </>
      )}
    </StepLayout>
  );
}
