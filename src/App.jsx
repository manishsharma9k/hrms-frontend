import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import GoogleAuthSuccess from './pages/auth/GoogleAuthSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateApply from './pages/CandidateApply';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import Departments from './pages/admin/Departments';
import LeaveApprovals from './pages/admin/LeaveApprovals';
import Payroll from './pages/admin/Payroll';
import AttendanceAdmin from './pages/admin/AttendanceAdmin';
import Recruitment from './pages/admin/Recruitment';
import Performance from './pages/admin/Performance';
import Reports from './pages/admin/Reports';
import AccessControl from './pages/admin/AccessControl';
import EmployeeProfile from './pages/admin/EmployeeProfile';
import Settings from './pages/Settings';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import LeaveRequests from './pages/employee/LeaveRequests';
import Attendance from './pages/employee/Attendance';
import SalaryDetails from './pages/employee/SalaryDetails';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth — separate routes for employee and admin */}
        <Route path="/" element={<Login />} />
        <Route path="/employee-register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        <Route path="/candidate-apply" element={<CandidateApply />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <Layout title="Admin Dashboard" />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="attendance" element={<AttendanceAdmin />} />
          <Route path="leaves" element={<LeaveApprovals />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="access" element={<AccessControl />} />
          <Route path="employees/:id/profile" element={<EmployeeProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute roleRequired="employee">
            <Layout title="Employee Portal" />
          </ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="leaves" element={<LeaveRequests />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="salary" element={<SalaryDetails />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
