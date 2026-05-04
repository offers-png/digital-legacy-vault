import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Assets = lazy(() => import("./pages/Assets"));
const Executors = lazy(() => import("./pages/Executors"));
const AIGuidance = lazy(() => import("./pages/AIGuidance"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />

        {/* Fix old /dashboard redirect */}
        <Route path="/dashboard">
          <Redirect to="/" />
        </Route>

        <Route path="/check-in" component={CheckIn} />
        <Route path="/assets" component={Assets} />
        <Route path="/executors" component={Executors} />
        <Route path="/ai-guidance" component={AIGuidance} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/404" component={NotFound} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
