import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { Toaster } from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            {children}
        </TooltipProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
