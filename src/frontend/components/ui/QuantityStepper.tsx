"use client";

import { CONTENT } from "@/lib/site-config";

interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
  label?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min,
  max,
  label = CONTENT.common.quantity,
}: QuantityStepperProps) {
  return (
    <div className="qty-stepper" role="group" aria-label={label}>
      <button
        className="qty-btn"
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={CONTENT.common.decreaseQuantity}
      >
        −
      </button>
      <span className="qty-display" aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        className="qty-btn"
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={CONTENT.common.increaseQuantity}
      >
        +
      </button>
    </div>
  );
}
