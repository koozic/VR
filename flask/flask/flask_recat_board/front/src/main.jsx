import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Board from "./board/board.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* <Board /> */}
  </StrictMode>,
);
