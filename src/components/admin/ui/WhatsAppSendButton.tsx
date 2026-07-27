import { MessageCircle } from "lucide-react";
import { adminButtonClass } from "@/components/admin/AdminButton";
import { buildWhatsappHref } from "@/lib/whatsapp";

/**
 * Opens WhatsApp Web/App with a pre-filled message to the customer's phone —
 * the admin still has to hit Send inside WhatsApp themselves.
 */
export function WhatsAppSendButton({
  phone,
  message,
  label = "Send via WhatsApp",
  iconOnly = false,
  variant = "secondary",
  size = "md",
}: {
  phone: string;
  message: string;
  label?: string;
  iconOnly?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "lg" | "md" | "icon";
}) {
  return (
    <a
      href={buildWhatsappHref(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={adminButtonClass({ variant, size: iconOnly ? "icon" : size })}
      aria-label={label}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      {iconOnly ? <span className="sr-only">{label}</span> : label}
    </a>
  );
}
