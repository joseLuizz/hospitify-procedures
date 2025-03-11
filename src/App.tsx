
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PatientProvider } from "./contexts/PatientContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PatientRegistration from "./pages/PatientRegistration";
import Triage from "./pages/Triage";
import Consultation from "./pages/Consultation";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PatientProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              
              <Route path="/atendimento" element={
                <Layout>
                  <PatientRegistration />
                </Layout>
              } />
              
              <Route path="/triagem" element={
                <Layout>
                  <Triage />
                </Layout>
              } />
              
              <Route path="/consulta" element={
                <Layout>
                  <Consultation />
                </Layout>
              } />
              
              <Route path="/relatorios" element={
                <Layout>
                  <Reports />
                </Layout>
              } />
              
              <Route path="/usuarios" element={
                <Layout>
                  <UserManagement />
                </Layout>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PatientProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
