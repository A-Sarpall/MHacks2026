import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const EvalPage = lazy(() => import("./vision/eval/EvalPage").then((m) => ({ default: m.EvalPage })));
const isEval = new URLSearchParams(window.location.search).has("eval");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isEval ? (
      <Suspense fallback={null}>
        <EvalPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
