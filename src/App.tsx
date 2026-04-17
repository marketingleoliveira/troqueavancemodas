import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Portal from "./pages/Portal.tsx";
import AdminLayout from "./pages/AdminLayout.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminRequests from "./pages/AdminRequests.tsx";
import AdminChats from "./pages/AdminChats.tsx";
import AdminSettings from "./pages/AdminSettings.tsx";
import CustomerAuth from "./pages/CustomerAuth.tsx";
import CustomerLayout from "./pages/CustomerLayout.tsx";
import CustomerRequests from "./pages/CustomerRequests.tsx";
import CustomerNewRequest from "./pages/CustomerNewRequest.tsx";
import CustomerRequestDetail from "./pages/CustomerRequestDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/auth" element={<CustomerAuth />} />
          <Route path="/minha-conta" element={<CustomerLayout />}>
            <Route index element={<CustomerRequests />} />
            <Route path="nova" element={<CustomerNewRequest />} />
            <Route path="solicitacao/:id" element={<CustomerRequestDetail />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="chats" element={<AdminChats />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
