import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import SearchResults from "@/pages/SearchResults";
import PropertyDetail from "@/pages/PropertyDetail";
import Dashboard from "@/pages/Dashboard";
import ListProperty from "@/pages/ListProperty";
import ChatPage from "@/pages/ChatPage";
import ScheduleViewing from "@/pages/ScheduleViewing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/search" component={SearchResults} />
          <Route path="/property/:id" component={PropertyDetail} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/list-property" component={ListProperty} />
          <Route path="/chat/:propertyId" component={ChatPage} />
          <Route path="/schedule/:propertyId" component={ScheduleViewing} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
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
