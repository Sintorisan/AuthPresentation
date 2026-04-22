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
          <div className="story-block">
            <p className="eyebrow">Startpunkt</p>
            <h3>Logga in med email och lösenord</h3>
            <p>
              Första lagret är enkelt: klienten skickar uppgifter, servern
              kontrollerar dem och svarar med vad den vet om användaren.
            </p>
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
          <div className="demo-block">
            <p className="eyebrow">Demo</p>
            <h3>HTTP requesten visar vad servern får</h3>
            <p>
              Det här är den nödvändiga kontrollpunkten: servern behöver se
              lösenordet för att verifiera användaren.
            </p>
          </div>

          <pre className="code-block">
            {`POST /api/v1/auth/login
Content-Type: application/json

${requestBody}`}
          </pre>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div className="problem-block">
            <p className="eyebrow">Risk</p>
            <h3>Problemet uppstår om lösenordet lagras i klartext</h3>
            <p>
              Om databasen läcker kan angriparen direkt läsa alla lösenord och
              testa dem på andra tjänster t.ex.
            </p>
          </div>

          <pre className="code-block">
            {`User:
Email: ${loginResult?.email}
Password: ${loginResult?.originalPassword} ❌`}
          </pre>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Lösning</p>
            <h3>Hashning</h3>
            <p>
              Istället för lösenordet, sparas ett krypterat resultat. Servern kan
              jämföra hashvärden utan att behöva lagra originalet.
            </p>
          </div>

          <pre className="code-block">
            {`User:
Email: ${loginResult?.email}
PasswordHash: ${loginResult?.hashedPassword}`}
          </pre>
        </>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <>
          <div className="comparison-grid">
            <div className="card danger">
              <h4>Problem: lösenord i varje request</h4>
              <p>Identiteten bevisas om och om igen med samma känsliga information.</p>
            </div>

            <div className="card success">
              <h4>Lösning: bevis på inloggning</h4>
              <p>Efter login vill vi skicka ett tidsbegränsat bevis istället.</p>
            </div>
          </div>

          <pre className="code-block">
            {`GET /api/data
{
  "email": "${loginResult?.email}",
  "password": "${loginResult?.originalPassword}"
}`}
          </pre>

          <div className="transition-block">
            <p className="eyebrow">Handoff</p>
            <h3>Vi behöver ett bevis på login, inte lösenordet igen.</h3>
            <p>
              Nästa steg är att låta servern utfärda en token som klienten kan
              använda för att visa: jag är redan verifierad.
            </p>
          </div>
        </>
      )}
    </StepLayout>
  );
}
