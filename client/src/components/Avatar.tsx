import BoringAvatar from "boring-avatars";

export function Avatar({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <BoringAvatar
      size={size}
      name={name}
      variant="marble"
      colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
    />
  );
}
