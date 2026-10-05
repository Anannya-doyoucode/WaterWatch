import { Droplet } from "lucide-react";

export function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Droplet className="size-8 animate-pulse text-primary" aria-label="Loading" />
    </div>
  );
}
