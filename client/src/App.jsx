import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import UploadResource from "./pages/UploadResource";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import AskQuestion from "./pages/AskQuestion";
import Profile from "./pages/Profile";

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />

              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/upload" element={<UploadResource />} />

              <Route path="/questions" element={<Questions />} />
              <Route path="/questions/:id" element={<QuestionDetail />} />
              <Route path="/ask" element={<AskQuestion />} />

              <Route path="/u/:username" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;