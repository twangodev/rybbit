import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export function StandardPage({ children, showSidebar = true }: { children: React.ReactNode; showSidebar?: boolean }) {
  return (
    <div className="h-full flex w-full">
      {showSidebar && <AppSidebar />}
      <main className="flex flex-col items-center p-4 w-full h-screen overflow-y-auto">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
