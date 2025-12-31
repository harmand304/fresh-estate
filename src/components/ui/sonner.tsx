import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: 
            "group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-emerald-500 group-[.toaster]:!to-green-600 group-[.toaster]:!text-white group-[.toaster]:!border-green-400 group-[.toaster]:!shadow-lg group-[.toaster]:!shadow-green-500/20",
          error:
            "group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-red-500 group-[.toaster]:!to-rose-600 group-[.toaster]:!text-white group-[.toaster]:!border-red-400 group-[.toaster]:!shadow-lg group-[.toaster]:!shadow-red-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
