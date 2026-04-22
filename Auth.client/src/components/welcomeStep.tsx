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
      <div className="story-block">
        <p className="eyebrow">Från inloggning till skyddat system</p>
        <h3>Vi bygger säkerhet lager för lager.</h3>
        <p>
          Den här applikationen visar hur autentisering fungerar steg för steg:
          först bevisar vi vem användaren är, sedan skyddar vi sessionen och
          till sist styr vi vad användaren får göra.
        </p>
      </div>

      <div className="flow-row">
        <span className="flow-step">Lösenord</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">Hashning</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">JWT</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">Refresh token</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">Roller</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">Hotbild</span>
      </div>

      <div className="mini-grid">
        <div className="mini-card">
          <h4>Identitet</h4>
          <p>Hur vet servern vem användaren är?</p>
        </div>
        <div className="mini-card">
          <h4>Session</h4>
          <p>Hur håller vi användaren inloggad utan onödig risk?</p>
        </div>
        <div className="mini-card">
          <h4>Åtkomst</h4>
          <p>Hur avgör vi vilka resurser användaren får nå?</p>
        </div>
      </div>
    </StepLayout>
  );
}
