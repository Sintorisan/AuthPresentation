import { useState } from "react";
import { StepLayout } from "./stepLayout";

type LoginResult = {
  email: string;
  originalPassword: string;
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

    setLoginResult({
      email: data.email,
      originalPassword: data.password,
      hashedPassword: data.hashedPassword,
    });

    // small delay for UX clarity
    await new Promise((r) => setTimeout(r, 400));

    setStep(2);
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <StepLayout
      title="Grundläggande inloggning"
      step={step}
      maxStep={5}
      onNext={next}
      onBack={back}
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

          <button
            onClick={handleLogin}
            disabled={!email || !password}
          >
            Logga in
          </button>
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
            Här skickas email och lösenord direkt till servern.
          </p>

          <p>
            Detta är nödvändigt för att verifiera användaren.
          </p>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h3>Problem: Lösenord i databasen</h3>

          <pre className="code-block">
            {`User:
Email: ${loginResult?.email}
Password: ${loginResult?.originalPassword} ❌`}
          </pre>

          <p>
            Om lösenord sparas i klartext och databasen läcker,
            kan angripare direkt läsa alla användares lösenord.
          </p>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <h3>Lösning: Hashning</h3>

          <pre className="code-block">
            {`User:
Email: ${loginResult?.email}
PasswordHash: ${loginResult?.hashedPassword}`}
          </pre>

          <p>
            Istället för att lagra lösenordet skapas en hash.
          </p>

          <p>
            En hash går inte att omvandla tillbaka till originalet,
            vilket gör dataläckor mycket mindre farliga.
          </p>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <h3>Problem kvarstår</h3>

          <pre className="code-block">
            {`GET /api/data
{
  "email": "${loginResult?.email}",
  "password": "${loginResult?.originalPassword}"
}`}
          </pre>

          <p>
            Varje request kräver fortfarande att lösenordet skickas igen.
          </p>

          <p>
            Det betyder att lösenordet kontinuerligt färdas över nätverket.
          </p>

          <p>
            Detta är osäkert → vi behöver ett bättre sätt att identifiera användaren.
          </p>
        </>
      )}
    </StepLayout>
  );
}
