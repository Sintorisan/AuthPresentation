import { useState } from "react";
import { WelcomeStep } from "./components/welcomeStep";
import { BasicStep } from "./components/basicStep";
import { JwtStep } from "./components/jwtStep";
import { RefreshStep } from "./components/refreshStep";

type Page = {
  key: string;
  label: string;
  component: React.ReactNode;
};

const pages: Page[] = [
  { key: "welcome", label: "Välkommen", component: <WelcomeStep /> },
  { key: "basic", label: "Grundläggande Inloggning", component: <BasicStep /> },
  { key: "jwt", label: "JWT", component: <JwtStep /> },
  { key: "refresh", label: "Refresh Token", component: <RefreshStep /> },
  { key: "authz", label: "Auktorisering", component: <h2>Auktorisering</h2> },
  { key: "security", label: "Säkerhet", component: <h2>Säkerhet</h2> },
];

function App() {
  const [pageIndex, setPageIndex] = useState(0);

  const prevPage = pages[pageIndex - 1];
  const currPage = pages[pageIndex];
  const nextPage = pages[pageIndex + 1];

  const isFirst = pageIndex === 0;
  const isLast = pageIndex === pages.length - 1;

  const navigate = (dir: number) => {
    setPageIndex((prev) =>
      Math.max(0, Math.min(prev + dir, pages.length - 1))
    );
  };

  return (
    <div className="app">

      {/* NAVIGATION */}
      <nav className="nav">
        <button onClick={() => navigate(-1)} disabled={isFirst}>
          {prevPage ? `← ${prevPage.label}` : "—"}
        </button>

        <div className="nav-center">
          <h1 className="nav-title">{currPage.label}</h1>
        </div>

        <button onClick={() => navigate(1)} disabled={isLast}>
          {nextPage ? `${nextPage.label} →` : "—"}
        </button>
      </nav>

      {/* CONTENT */}
      <main className="page-container">
        <div className="page-inner">
          {currPage.component}
        </div>
      </main>

    </div>
  );
}

export default App;
