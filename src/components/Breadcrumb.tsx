import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  const location = useLocation();

  // Auto-generate breadcrumb items from URL if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    
    const crumbs: BreadcrumbItem[] = pathnames.map((value, index) => {
      const href = `/${pathnames.slice(0, index + 1).join("/")}`;
      // Format label: replace hyphens with spaces and capitalize
      const label = value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      
      // Last item doesn't have a link
      const isLast = index === pathnames.length - 1;
      return { label, href: isLast ? undefined : href };
    });

    return crumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Home Link */}
      <Link
        to="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
