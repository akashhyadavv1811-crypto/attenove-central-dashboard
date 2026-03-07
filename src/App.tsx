import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Organizations from "./pages/Organizations";
import Offices from "./pages/Offices";
import Shifts from "./pages/Shifts";
import Reports from "./pages/Reports";
import AccessControl from "./pages/AccessControl";
import BiometricDevices from "./pages/BiometricDevices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
              <Route path="/offices" element={<ProtectedRoute><Offices /></ProtectedRoute>} />
              <Route path="/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/access-control" element={<ProtectedRoute><AccessControl /></ProtectedRoute>} />
              <Route path="/biometric-devices" element={<ProtectedRoute><BiometricDevices /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
