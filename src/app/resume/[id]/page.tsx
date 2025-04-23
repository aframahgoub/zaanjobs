import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ResumePageClient from "./page.client";

export const dynamic = "force-dynamic";

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 bg-[#f1f8f9] min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#00acc1] mb-4" />
            <p className="text-[#18515b]">Loading resume...</p>
          </div>
        </div>
      }
    >
      <ResumePageClient />
    </Suspense>
  );
}
