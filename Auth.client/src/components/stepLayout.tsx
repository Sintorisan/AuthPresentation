type StepLayoutProps = {
  title: string;
  step: number;
  maxStep: number;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
};

export function StepLayout({
  title,
  step,
  maxStep,
  onNext,
  onBack,
  children,
}: StepLayoutProps) {
  return (
    <div className="step-layout">

      {/* HEADER */}
      <div className="step-header">
        <h2>{title}</h2>
        <span className="step-indicator">
          Steg {step} / {maxStep}
        </span>
      </div>

      {/* CONTENT */}
      <div className="step-content">
        {children}
      </div>

      {/* NAVIGATION */}
      {maxStep > 1 && (
        <div className="step-nav">
          <button onClick={onBack} disabled={step === 1}>
            Tillbaka
          </button>

          <button onClick={onNext} disabled={step === maxStep}>
            Nästa
          </button>
        </div>
      )}

    </div>
  );
}
