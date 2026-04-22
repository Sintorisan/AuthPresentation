import { StepLayout } from "./stepLayout";
import { useState } from "react";

export function SecurityStep() {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <StepLayout
      title="Säkerhet & Hotbild"
      step={step}
      maxStep={3}
      onNext={next}
      onBack={back}
    >
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div className="solution-block">
            <p className="eyebrow">Capstone</p>
            <h3>Nu kopplar vi varje lager till hotbilden</h3>
            <p>
              Login, JWT, refresh tokens och roller är inte separata trick.
              Tillsammans bygger de ett system som kan stå emot flera typer av risk.
            </p>
          </div>

          <div className="security-grid">
            <div className="mini-card">
              <h4>Man-in-the-Middle</h4>
              <p><strong>Skydd:</strong> HTTPS krypterar trafiken och skyddar data i transit.</p>
            </div>

            <div className="mini-card">
              <h4>Token theft</h4>
              <p><strong>Skydd:</strong> Kortlivade tokens begränsar skadan vid läckage.</p>
            </div>

            <div className="mini-card">
              <h4>Lång session</h4>
              <p><strong>Skydd:</strong> Refresh tokens balanserar säkerhet och användarupplevelse.</p>
            </div>

            <div className="mini-card">
              <h4>Obehörig åtkomst</h4>
              <p><strong>Skydd:</strong> Roller och backend-kontroller skyddar känsliga resurser.</p>
            </div>
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="takeaway-block">
            <p className="eyebrow">Bredare hotbild</p>
            <h3>Vanliga säkerhetshot</h3>
            <p>
              Auth-lagren är viktiga, men ett säkert system behöver även skydd
              för nätverk, input, webbläsare och systemdesign.
            </p>
          </div>

          <h4>🌐 Nätverk</h4>

          <p><strong>Man-in-the-Middle</strong><br />
            En angripare placerar sig mellan klient och server och kan läsa eller manipulera trafiken som skickas.
            Detta kan innebära att lösenord, tokens eller annan känslig data exponeras.
            <br /><strong>Förebygg:</strong> Använd HTTPS (TLS) för att kryptera all kommunikation.
            <br /><strong>Varför:</strong> Skyddar data medan den färdas över nätverket.</p>

          <p><strong>Insecure Transport</strong><br />
            Om data skickas över HTTP istället för HTTPS kan den läsas i klartext av tredje part.
            Detta gäller särskilt inloggning och API-anrop.
            <br /><strong>Förebygg:</strong> Tvinga HTTPS och blockera osäkra anslutningar.
            <br /><strong>Varför:</strong> Förhindrar att känslig information läcker.</p>

          <h4>🔐 Autentisering & Session</h4>

          <p><strong>Brute Force</strong><br />
            Angripare testar många lösenord i snabb följd för att försöka hitta rätt kombination.
            Detta sker ofta automatiserat.
            <br /><strong>Förebygg:</strong> Rate limiting, kontolåsning och starka lösenord.
            <br /><strong>Varför:</strong> Skyddar användarkonton från att bli komprometterade.</p>

          <p><strong>Credential Stuffing</strong><br />
            Läckta användaruppgifter från andra tjänster återanvänds för att logga in.
            Eftersom många återanvänder lösenord är detta effektivt.
            <br /><strong>Förebygg:</strong> MFA och upptäckt av ovanliga inloggningar.
            <br /><strong>Varför:</strong> Minskar risken att återanvända lösenord leder till intrång.</p>

          <p><strong>Session Hijacking</strong><br />
            En angripare kapar en aktiv session genom att få tillgång till en giltig token eller cookie.
            <br /><strong>Förebygg:</strong> Kortlivade tokens, säkra cookies och HTTPS.
            <br /><strong>Varför:</strong> Skyddar aktiva användarsessioner.</p>

          <p><strong>Weak Passwords</strong><br />
            Enkla eller korta lösenord är lätta att gissa eller knäcka med attacker.
            <br /><strong>Förebygg:</strong> Krav på starka lösenord och validering.
            <br /><strong>Varför:</strong> Gör attacker betydligt svårare.</p>

          <h4>🧾 Data & Input</h4>

          <p><strong>SQL Injection</strong><br />
            Skadlig input manipulerar databasfrågor och kan ge åtkomst till eller ändra data.
            <br /><strong>Förebygg:</strong> Parametriserade queries eller ORM.
            <br /><strong>Varför:</strong> Skyddar databasen från manipulation.</p>

          <p><strong>Command Injection</strong><br />
            Angripare injicerar systemkommandon via input som exekveras på servern.
            <br /><strong>Förebygg:</strong> Validera och begränsa input.
            <br /><strong>Varför:</strong> Skyddar servermiljön.</p>

          <p><strong>Sensitive Data Exposure</strong><br />
            Känslig data lagras eller skickas utan skydd, t.ex. lösenord i klartext.
            <br /><strong>Förebygg:</strong> Hashning, kryptering och säker lagring.
            <br /><strong>Varför:</strong> Skyddar användardata vid läckor.</p>

          <p><strong>Insecure Deserialization</strong><br />
            Manipulerad data skickas till servern och körs som kod eller objekt.
            <br /><strong>Förebygg:</strong> Validera och begränsa deserialisering.
            <br /><strong>Varför:</strong> Förhindrar kodexekvering.</p>

          <h4>🌍 Webbläsare</h4>

          <p><strong>XSS (Cross-Site Scripting)</strong><br />
            Skadlig JavaScript-kod injiceras och körs i användarens webbläsare.
            Detta kan stjäla tokens eller manipulera UI.
            <br /><strong>Förebygg:</strong> Escape output och validera input.
            <br /><strong>Varför:</strong> Skyddar användaren och sessioner.</p>

          <p><strong>CSRF</strong><br />
            En användare luras att utföra en handling utan att veta om det.
            Detta sker ofta via redan autentiserade sessioner.
            <br /><strong>Förebygg:</strong> CSRF-tokens och säkra cookies.
            <br /><strong>Varför:</strong> Skyddar mot oavsiktliga handlingar.</p>

          <p><strong>Clickjacking</strong><br />
            Användaren luras klicka på något osynligt eller dolt.
            <br /><strong>Förebygg:</strong> X-Frame-Options eller CSP.
            <br /><strong>Varför:</strong> Skyddar användarens interaktion.</p>

          <h4>🏗️ Systemdesign</h4>

          <p><strong>Broken Access Control</strong><br />
            Systemet kontrollerar inte korrekt vem som får åtkomst till resurser.
            <br /><strong>Förebygg:</strong> Kontrollera access på backend.
            <br /><strong>Varför:</strong> Förhindrar obehörig åtkomst.</p>

          <p><strong>IDOR</strong><br />
            Direkt åtkomst till resurser via ID utan kontroll.
            <br /><strong>Förebygg:</strong> Verifiera ägarskap och behörighet.
            <br /><strong>Varför:</strong> Skyddar användarspecifik data.</p>

          <p><strong>Security Misconfiguration</strong><br />
            Felaktiga inställningar i system eller server kan öppna upp för attacker.
            <br /><strong>Förebygg:</strong> Säker standardkonfiguration och uppdateringar.
            <br /><strong>Varför:</strong> Minskar attackytan.</p>

          <p><strong>Excessive Data Exposure</strong><br />
            API:er returnerar mer data än nödvändigt.
            <br /><strong>Förebygg:</strong> Returnera endast nödvändig data.
            <br /><strong>Varför:</strong> Begränsar vad en angripare kan få ut.</p>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div className="takeaway-block">
            <p className="eyebrow">Sammanfattning</p>
            <h3>Säkerhet byggs i lager</h3>
            <p>
              Ingen enskild lösning räcker. Varje lager tar bort en viss risk
              och gör nästa lager enklare att lita på.
            </p>
          </div>

          <div className="flow-row">
            <span className="flow-step">HTTPS skyddar trafik</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">JWT hanterar identitet</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Refresh token hanterar session</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Roller styr åtkomst</span>
          </div>

          <div className="solution-block">
            <p>Tillsammans skapar de ett säkrare system.</p>
          </div>
        </>
      )}
    </StepLayout>
  );
}
