import Image from "next/image";
import { BRAND_NAME, BRAND_SEAL } from "@/lib/brand";

const SIZES = {
  sm: 44,
  md: 64,
  lg: 108,
  xl: 168,
} as const;

export function Seal({
  size = "md",
  animate = false,
  className = "",
}: {
  size?: keyof typeof SIZES;
  animate?: boolean;
  className?: string;
}) {
  const px = SIZES[size];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full shadow-seal ${
        animate ? "animate-stamp" : ""
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <span className="absolute inset-0 rounded-full ring-1 ring-gold/40" />
      <Image
        src={BRAND_SEAL}
        alt={BRAND_NAME}
        width={px}
        height={px}
        priority
        className="rounded-full object-cover"
      />
    </span>
  );
}
