import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";

import MapHome from "./pages/MapHome";
import Gallery from "./pages/Gallery";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapHome />} />
        <Route path="/gallery/:id" element={<Gallery />} />
      </Routes>
    </Router>
  );
}

export default App;
 