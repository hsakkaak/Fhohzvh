import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/hooks/use-auth";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Control from "@/pages/Control";
import Features from "@/pages/Features";
import Groups from "@/pages/Groups";
import Logs from "@/pages/Logs";
import Files from "@/pages/Files";
import NotFound from "@/pages/not-found";

// ================= PROTECTED ROUTE =================
function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

// ================= ROUTER =================
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>

      <Route path="/control">
        <ProtectedRoute component={Control} />
      </Route>

      <Route path="/features">
        <ProtectedRoute component={Features} />
      </Route>

      <Route path="/groups">
        <ProtectedRoute component={Groups} />
      </Route>

      <Route path="/logs">
        <ProtectedRoute component={Logs} />
      </Route>

      <Route path="/files">
        <ProtectedRoute component={Files} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

// ================= APP ROOT =================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
