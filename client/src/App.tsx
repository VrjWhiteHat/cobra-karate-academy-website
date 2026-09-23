import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Academy from "./pages/Academy";
import Training from "./pages/Training";
import Achievements from "./pages/Achievements";
import Gallery from "./pages/Gallery";
import Attendance from "./pages/Attendance";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/academy" component={Academy} />
      <Route path="/training" component={Training} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/contact" component={Contact} />
      <Route path="/coach-login" component={Admin} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
