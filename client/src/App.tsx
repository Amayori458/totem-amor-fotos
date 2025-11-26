import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import QRCodeScreen from "./pages/QRCodeScreen";
import MobileUpload from "./pages/MobileUpload";
import PhotoSelection from "./pages/PhotoSelection";
import FormatSelection from "./pages/FormatSelection";
import Processing from "./pages/Processing";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Welcome} />
      <Route path={"/qrcode"} component={QRCodeScreen} />
      <Route path={"/upload/:sessionId"} component={MobileUpload} />
      <Route path={"/select/:sessionId"} component={PhotoSelection} />
      <Route path={"/format/:sessionId"} component={FormatSelection} />
      <Route path={"/processing/:orderNumber"} component={Processing} />
      <Route path={"/admin"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
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
