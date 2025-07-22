import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export function StandardPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex w-full">
      <AppSidebar />
      <main className="flex flex-col items-center p-4 w-full">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
