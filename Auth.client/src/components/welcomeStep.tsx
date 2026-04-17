import { StepLayout } from "./stepLayout";

export function WelcomeStep() {
  return (
    <StepLayout
      title="Välkommen"
      step={1}
      maxStep={1}
      onNext={() => { }}
      onBack={() => { }}
    >
      <p>
        Den här applikationen visar hur autentisering fungerar steg för steg.
      </p>

      <p>
        Vi börjar med en enkel inloggning och bygger sedan vidare till säkrare lösningar.
      </p>

      <div className="code-block">
        {`Vad du kommer lära dig:

1. Grundläggande inloggning
2. Varför lösenord är känsliga
3. Hashning
4. JWT (tokens)
5. Refresh tokens
6. Auktorisering`}
      </div>
    </StepLayout>
  );
}
