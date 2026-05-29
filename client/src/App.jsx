import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import { Suspense, lazy } from "react";
import PageLoadingSkeleton from "./components/PageLoadingSkeleton";

const Home = lazy(() => import("./pages/Home"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const UploadResource = lazy(() => import("./pages/UploadResource"));
const Questions = lazy(() => import("./pages/Questions"));
const QuestionDetail = lazy(() => import("./pages/QuestionDetail"));
const AskQuestion = lazy(() => import("./pages/AskQuestion"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const PostsFeed = lazy(() => import("./pages/PostsFeed"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const PostEditor = lazy(() => import("./pages/PostEditor"));
const FollowList = lazy(() => import("./pages/FollowList"));
const EditProfile = lazy(() => import("./pages/EditProfile"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <Routes>
                {/* Public routes without layout */}
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* OAuth callback (within layout for error display) */}
                <Route element={<Layout />}>
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

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
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;