export function useIsProduction() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isProduction = hostname === "demo.rybbit.io" || hostname === "app.rybbit.io";
  const isAppProduction = hostname === "app.rybbit.io";

  return { isProduction, isAppProduction };
}
