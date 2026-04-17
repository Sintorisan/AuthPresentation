import { useState } from "react";
import { StepLayout } from "./stepLayout";

type LoginResult = {
  email: string;
  password: string;
  hashedPassword: string;
};

export function BasicStep() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [requestBody, setRequestBody] = useState("");

  const handleLogin = async () => {
    const body = JSON.stringify({ email, password }, null, 2);
    setRequestBody(body);

    const res = await fetch("http://localhost:5136/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json();
    setLoginResult(data);

    setStep(2);
  };

  return (
    <StepLayout
      title="Grundläggande inloggning"
      step={step}
      maxStep={5}
      onNext={() => setStep((s) => s + 1)}
      onBack={() => setStep((s) => s - 1)}
    >
      {/* STEP 1 */}
      {step === 1 && (
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

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3>HTTP Request</h3>

          <pre className="code-block">
            {`POST /api/v1/auth/login
Content-Type: application/json

${requestBody}`}
          </pre>

          <p>
            Här skickas lösenordet direkt till servern för validering.
          </p>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h3>Databas (osäkert)</h3>

          <pre className="code-block">
            {`User:
Email: ${loginResult?.email}
Password: ${loginResult?.password} ❌`}
          </pre>

          <p>
            Om databasen läcker får en angripare tillgång till riktiga lösenord.
          </p>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <h3>Hashning</h3>

          <pre className="code-block">
            {`User:
Email: ${loginResult?.email}
PasswordHash: ${loginResult?.hashedPassword}`}
          </pre>

          <p>
            Istället för lösenord sparas en hash.
            Det gör det mycket svårare att återställa lösenordet.
          </p>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <h3>Problemet kvarstår</h3>

          <pre className="code-block">
            {`GET /api/data
{
  "email": "${loginResult?.email}",
  "password": "${loginResult?.password}"
}`}
          </pre>

          <p>
            Lösenordet måste fortfarande skickas vid varje request.
          </p>

          <p>
            Detta är osäkert → vi behöver något bättre.
          </p>

          <p>
            Nästa steg: <strong>JWT (tokens)</strong>
          </p>
        </>
      )}
    </StepLayout>
  );
}
