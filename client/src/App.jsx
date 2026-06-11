import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { Suspense, lazy } from "react";
import PageLoadingSkeleton from "./components/PageLoadingSkeleton";

const Home = lazy(() => import("./pages/Home"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const UploadResource = lazy(() => import("./pages/UploadResource"));
const Library = lazy(() => import("./pages/Library"));
const Explore = lazy(() => import("./pages/Explore"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
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
const Opportunities = lazy(() => import("./pages/Opportunities"));
const OpportunityDetail = lazy(() => import("./pages/OpportunityDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminOpportunities = lazy(() => import("./pages/admin/AdminOpportunities"));
const AdminFeatured = lazy(() => import("./pages/admin/AdminFeatured"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDeletedContent = lazy(() => import("./pages/admin/AdminDeletedContent"));
const AdminBooks = lazy(() => import("./pages/admin/AdminBooks"));

// Static pages
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));

import { useAuth } from "./context/AuthContext";

function AuthWrapper({ children }) {
  const { loading } = useAuth();
  if (loading) {
    return <PageLoadingSkeleton />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <AuthWrapper>
                <Routes>
                {/* Public routes without layout */}
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* OAuth callback (within layout for error display) */}
                <Route element={<Layout />}>
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />

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

                  <Route path="/library" element={<Library />} />
                  <Route path="/library/:publicId" element={<BookDetail />} />

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
                  <Route
                    path="/settings/profile"
                    element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
                  />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route
                    path="/u/:username/followers"
                    element={<ProtectedRoute><FollowList mode="followers" /></ProtectedRoute>}
                  />
                  <Route
                    path="/u/:username/following"
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

                  {/* Static informational pages */}

                  {/* Posts — Knowledge Publishing */}
                  <Route path="/posts" element={<PostsFeed />} />
                  <Route
                    path="/posts/new"
                    element={
                      <ProtectedRoute>
                        <PostEditor />
                      </ProtectedRoute>
                    }
                  />

                  {/* Opportunities */}
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/opportunities/:id" element={<OpportunityDetail />} />
                  <Route path="/posts/:slug" element={<PostDetail />} />
                  <Route
                    path="/posts/:id/edit"
                    element={
                      <ProtectedRoute>
                        <PostEditor />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all for non-admin pages */}
                  <Route path="*" element={<NotFound />} />
                  </Route>

                {/* Admin Routes (with Dedicated AdminLayout) */}
                <Route element={<AdminLayout />}>
                  <Route
                    path="/admin/reports"
                    element={<AdminReports />}
                  />
                  <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                  />
                  <Route
                    path="/admin/analytics"
                    element={<AdminAnalytics />}
                  />
                  <Route
                    path="/admin/opportunities"
                    element={<AdminOpportunities />}
                  />
                  <Route
                    path="/admin/featured"
                    element={<AdminFeatured />}
                  />
                  <Route
                    path="/admin/deleted-content"
                    element={<AdminDeletedContent />}
                  />
                  <Route
                    path="/admin/settings"
                    element={<AdminSettings />}
                  />
                  <Route
                    path="/admin/books/upload"
                    element={<AdminBooks />}
                  />
                </Route>
              </Routes>
              </AuthWrapper>
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
