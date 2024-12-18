import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import Summarize from "./pages/Summarize";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/summarize" element={<Summarize />} />
      </Routes>
    </>
  );
}

export default App;
