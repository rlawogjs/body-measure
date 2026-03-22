import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import UploadPage from "./pages/UploadPage";
import CalibratePage from "./pages/CalibratePage";
import ResultPage from "./pages/ResultPage";
import { getCurrentUser, isPrivileged } from "./utils/authStorage";

function PrivateRoute({ children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isPrivileged()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function HomeRedirect() {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isPrivileged()) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/calibrate"
          element={
            <PrivateRoute>
              <CalibratePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/result"
          element={
            <PrivateRoute>
              <ResultPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;