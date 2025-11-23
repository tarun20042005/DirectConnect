import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationBadgeProps {
  verified: boolean;
  size?: "sm" | "md";
}

export function VerificationBadge({ verified, size = "md" }: VerificationBadgeProps) {
  if (!verified) return null;

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
      data-testid="badge-verified"
    >
      <ShieldCheck className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      <span>Verified</span>
    </Badge>
  );
}
