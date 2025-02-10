import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import Landing from "./pages/landing";
import Index from "./pages/Index";
import Feedback from "./pages/Feedback";
import Progress from "./pages/progress";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
    },
  },
});

const App = () => {
  return (
    <StrictMode>
      <div className="min-h-screen app-background">
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  {/* Landing page is the default route */}
                  <Route path="/" element={<Landing />} />
                  
                  {/* Therapy session route */}
                  <Route path="/therapy" element={<Index />} />
                  
                  {/* Progress page route */}
                  <Route path="/progress" element={<Progress />} />
                  
                  {/* Feedback route */}
                  <Route path="/feedback" element={<Feedback />} />
                  
                  {/* Catch all other routes and redirect to landing */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </div>
    </StrictMode>
  );
};

export default App;