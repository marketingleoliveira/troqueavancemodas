import { Check } from "lucide-react";

interface PortalStepperProps {
  steps: string[];
  currentStep: number;
}

export const PortalStepper = ({ steps, currentStep }: PortalStepperProps) => {
  return (
    <div className="flex items-center justify-center mb-8 gap-1">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium hidden sm:block max-w-[60px] text-center leading-tight">
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 mx-1 transition-colors duration-300 ${
                i < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
