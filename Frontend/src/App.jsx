import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PredictionForm from "./Pages/PredictionForm";
import HomePage from "./Pages/HomePage";
import AboutInputs from "./Pages/AboutInputs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<PredictionForm />} />
        <Route path="/about" element={<AboutInputs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
