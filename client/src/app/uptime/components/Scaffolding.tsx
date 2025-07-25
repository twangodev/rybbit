export function Scaffolding({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col items-center p-4 w-full h-screen overflow-y-auto">
      <div className="w-full max-w-6xl space-y-4">{children}</div>
    </main>
  );
}
