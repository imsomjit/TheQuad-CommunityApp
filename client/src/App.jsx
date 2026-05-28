import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import UploadResource from "./pages/UploadResource";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import AskQuestion from "./pages/AskQuestion";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes (no layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Routes with layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />

                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <UploadResource />
                    </ProtectedRoute>
                  }
                />

                <Route path="/questions" element={<Questions />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />
                <Route
                  path="/ask"
                  element={
                    <ProtectedRoute>
                      <AskQuestion />
                    </ProtectedRoute>
                  }
                />

                <Route path="/u/:username" element={<Profile />} />

                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;