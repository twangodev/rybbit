import { Compass } from "lucide-react";
import Image from "next/image";

const OS_TO_LOGO: Record<string, string> = {
  Windows: "Windows.svg",
  "Windows Phone": "Windows.svg",
  Android: "Android.svg",
  android: "Android.svg",
  Linux: "Tux.svg",
  macOS: "macOS.svg",
  iOS: "Apple.svg",
  "Chrome OS": "Chrome.svg",
  "Chromecast Linux": "Chrome.svg",
  "Chromecast Fuchsia": "Chrome.svg",
  Ubuntu: "Ubuntu.svg",
  HarmonyOS: "HarmonyOS.svg",
  OpenHarmony: "OpenHarmony.png",
  PlayStation: "PlayStation.svg",
  Tizen: "Tizen.png",
  Symbian: "Symbian.svg",
  Debian: "Debian.svg",
  Fedora: "Fedora.svg",
  Nintendo: "Nintendo.svg",
  Xbox: "Xbox.svg",
};

export function OperatingSystem({ os = "" }: { os?: string }) {
  return (
    <>
      {OS_TO_LOGO[os] ? (
        <Image
          src={`/operating-systems/${OS_TO_LOGO[os]}`}
          alt={os || "Other"}
          className="w-4 h-4"
          width={16}
          height={16}
        />
      ) : (
        <Compass width={16} />
      )}
    </>
  );
}
