import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Leads from "./pages/Leads";
import Calls from "./pages/Calls";
import Campaigns from "./pages/Campaigns";
import Prompts from "./pages/Prompts";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <BrowserRouter basename="/dashboard">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/prompts" element={<Prompts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
