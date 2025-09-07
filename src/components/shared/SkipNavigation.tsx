import { cn } from "@/lib/utils";

interface SkipNavigationProps {
  className?: string;
}

function SkipNavigation({ className }: SkipNavigationProps) {
  return (
    <div className={cn("sr-only focus-within:not-sr-only", className)}>
      <a
        href="#main-content"
        className="
          absolute top-4 left-4 z-50 
          bg-primary text-primary-foreground 
          px-4 py-2 rounded-md font-medium
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-all duration-150
        "
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="
          absolute top-4 left-32 z-50
          bg-primary text-primary-foreground 
          px-4 py-2 rounded-md font-medium
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-all duration-150
        "
      >
        Skip to navigation
      </a>
    </div>
  );
}

export { SkipNavigation };