import { cn } from "../../../lib/utils";

export function Card({ title, description, children, className }) {
  return (
    <div className={cn("bg-neutral-800/50 p-6 rounded-xl", className)}>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      {description && <p className="text-neutral-300 mb-4">{description}</p>}
      {children}
    </div>
  );
}
