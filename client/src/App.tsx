import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import TimetableView from "@/pages/TimetableView";
import TimetableSettingsPage from "@/pages/TimetableSettingsPage";
import StudentsPage from "@/pages/StudentsPage";
import { StudentDetailPage } from "@/pages/StudentDetailPage";
import TeacherView from "@/pages/TeacherView";
import TeacherBulkUpload from "@/pages/TeacherBulkUpload";
import TeacherBulkReview from "@/pages/TeacherBulkReview";
import StudentBulkUpload from "@/pages/StudentBulkUpload";
import StudentBulkReview from "@/pages/StudentBulkReview";
import ClassesPage from "@/pages/ClassesPage";
import ClassDetailPage from "@/pages/ClassDetailPage";
import ClassBulkUpload from "@/pages/ClassBulkUpload";
import ClassBulkReview from "@/pages/ClassBulkReview";
import ClassBulkImportPage from "@/pages/ClassBulkImportPage";
import SubjectsPage from "@/pages/SubjectsPage";
import SchoolsPage from "@/pages/SchoolsPage";
import SettingsPage from "@/pages/SettingsPage";
import TeacherProfile from "@/pages/TeacherProfile";
import SystemModulesPage from "@/pages/SystemModulesPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import MyProfilePage from "@/pages/MyProfilePage";
import MyClassPage from "@/pages/MyClassPage";
import AttendancePage from "@/pages/AttendancePage";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Handle first-time login password change (standalone page without layout)
  if (user?.isFirstLogin) {
    return <ChangePasswordPage />;
  }

  const isSuperAdmin = user?.role === "super_admin";
  const isSchoolAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        
        {/* Super Admin only pages */}
        {isSuperAdmin && <Route path="/schools" component={SchoolsPage} />}
        {isSuperAdmin && <Route path="/admin-dashboard" component={AdminDashboardPage} />}
        {isSuperAdmin && <Route path="/system-modules" component={SystemModulesPage} />}
        
        {/* School Admin only pages */}
        {isSchoolAdmin && <Route path="/classes" component={ClassesPage} />}
        {isSchoolAdmin && <Route path="/classes/bulk-import" component={ClassBulkImportPage} />}
        {isSchoolAdmin && <Route path="/classes/bulk-upload" component={ClassBulkUpload} />}
        {isSchoolAdmin && <Route path="/classes/bulk-review" component={ClassBulkReview} />}
        {isSchoolAdmin && <Route path="/classes/:id" component={ClassDetailPage} />}
        {isSchoolAdmin && <Route path="/students" component={StudentsPage} />}
        {isSchoolAdmin && <Route path="/students/bulk-upload" component={StudentBulkUpload} />}
        {isSchoolAdmin && <Route path="/students/bulk-review" component={StudentBulkReview} />}
        {isSchoolAdmin && <Route path="/students/:id" component={StudentDetailPage} />}
        {isSchoolAdmin && <Route path="/subjects" component={SubjectsPage} />}
        {isSchoolAdmin && <Route path="/timetable" component={TimetableView} />}
        {isSchoolAdmin && <Route path="/timetable/settings" component={TimetableSettingsPage} />}
        {isSchoolAdmin && <Route path="/teachers" component={TeacherView} />}
        {isSchoolAdmin && <Route path="/teachers/bulk-upload" component={TeacherBulkUpload} />}
        {isSchoolAdmin && <Route path="/teachers/bulk-review" component={TeacherBulkReview} />}
        {isSchoolAdmin && <Route path="/teacher/:id" component={TeacherProfile} />}
        
        {/* Attendance - available to both school admin and super admin */}
        {(isSchoolAdmin || isSuperAdmin) && <Route path="/attendance" component={AttendancePage} />}
        
        {/* Student only pages */}
        {isStudent && <Route path="/my-class" component={MyClassPage} />}
        {isStudent && <Route path="/my-profile" component={MyProfilePage} />}
        
        {/* Settings page - available to all authenticated users */}
        <Route path="/settings" component={SettingsPage} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
