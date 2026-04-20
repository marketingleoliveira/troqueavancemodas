import logo from "@/assets/avance-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  invert?: boolean;
}

export const Logo = ({ className, invert = false }: LogoProps) => (
  <img
    src={logo}
    alt="Avance Modas"
    className={cn("object-contain select-none", invert && "invert brightness-0 contrast-200", className)}
    draggable={false}
  />
);
