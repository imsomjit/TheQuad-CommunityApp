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
import VerifyEmail from "./pages/VerifyEmail";
import Notifications from "./pages/Notifications";
import AuthCallback from "./pages/AuthCallback";
import PostsFeed from "./pages/PostsFeed";
import PostDetail from "./pages/PostDetail";
import PostEditor from "./pages/PostEditor";
import FollowList from "./pages/FollowList";
import EditProfile from "./pages/EditProfile";

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
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* OAuth callback (within layout for error display) */}
              <Route element={<Layout />}>
                <Route path="/auth/callback" element={<AuthCallback />} />

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

                <Route path="/pv/:username" element={<Profile />} />
                <Route
                  path="/settings/profile"
                  element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
                />
                <Route
                  path="/pv/:username/followers"
                  element={<ProtectedRoute><FollowList mode="followers" /></ProtectedRoute>}
                />
                <Route
                  path="/pv/:username/following"
                  element={<ProtectedRoute><FollowList mode="following" /></ProtectedRoute>}
                />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* Posts — Knowledge Publishing */}
                <Route path="/posts" element={<PostsFeed />} />
                <Route path="/posts/:slug" element={<PostDetail />} />
                <Route
                  path="/posts/new"
                  element={
                    <ProtectedRoute>
                      <PostEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/posts/:id/edit"
                  element={
                    <ProtectedRoute>
                      <PostEditor />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;