export default function StatusPage() {
  return (
    <main className="flex flex-col items-center p-4 w-full h-screen overflow-y-auto">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Uptime Monitoring</h1>
            <p className="text-sm text-neutral-500 mt-1">Monitor the availability and performance of your endpoints</p>
          </div>
        </div>
      </div>
    </main>
  );
}
