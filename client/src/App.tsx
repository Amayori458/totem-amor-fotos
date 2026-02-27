import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import Welcome from "./pages/Welcome";
import QRCodeScreen from "./pages/QRCodeScreen";
import MobileUpload from "./pages/MobileUpload";
import PhotoSelection from "./pages/PhotoSelection";
import FormatSelection from "./pages/FormatSelection";
import Processing from "./pages/Processing";
import Receipt from "./pages/Receipt";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/welcome"} component={Welcome} />
      <Route path={"/qrcode/:sessionId"} component={QRCodeScreen} />
      <Route path={"/upload/:sessionId"} component={MobileUpload} />
      <Route path={"/select/:sessionId"} component={PhotoSelection} />
      <Route path={"/format/:sessionId"} component={FormatSelection} />
      <Route path={"/processing/:orderNumber"} component={Processing} />
      <Route path={"/receipt/:orderNumber"} component={Receipt} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
