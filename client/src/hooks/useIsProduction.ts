import { useState, useEffect } from "react";

export function useIsProduction() {
  const [isProduction, setIsProduction] = useState(false);
  const [isAppProduction, setIsAppProduction] = useState(false);

  useEffect(() => {
    setIsProduction(
      window.location.hostname === "demo.rybbit.io" ||
        window.location.hostname === "app.rybbit.io"
    );
    setIsAppProduction(window.location.hostname === "app.rybbit.io");
  }, []);

  return { isProduction, isAppProduction };
}
