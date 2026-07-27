"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { DeckleCard } from "@/components/ui/DeckleCard";
import { ActionButton, LinkButton } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/site-content";

type Status = "idle" | "success";

/**
 * There is no booking backend, and the salon sends confirmations by hand
 * (PRODUCT.md). This form used to fake a network round trip and then claim
 * "Your request is received" — a visitor's reservation went nowhere. It now
 * composes the request and hands it to a channel the salon actually watches,
 * and says exactly what happened.
 */
export function ContactForm({
  salon,
  services,
}: {
  salon: SiteContent["salon"];
  services: SiteContent["services"];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [handoff, setHandoff] = useState<{ label: string; href: string } | null>(null);

  const channel = salon.hasWhatsapp
    ? ("whatsapp" as const)
    : salon.hasEmail
      ? ("email" as const)
      : salon.hasPhone
        ? ("phone" as const)
        : ("none" as const);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const service = String(data.get("service") ?? "").trim();
    const date = String(data.get("date") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "Please share your name.";
    if (!/^[0-9+\-\s]{7,}$/.test(phone)) {
      nextErrors.phone = "Please share a valid phone number.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const lines = [
      `Reservation request for ${salon.name}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      service ? `Service: ${service}` : null,
      date ? `Preferred date: ${date}` : null,
      message ? `Message: ${message}` : null,
    ].filter(Boolean) as string[];
    const body = lines.join("\n");

    if (channel === "whatsapp") {
      const href = `${salon.whatsappHref}?text=${encodeURIComponent(body)}`;
      window.open(href, "_blank", "noopener,noreferrer");
      setHandoff({ label: "Reopen WhatsApp", href });
    } else if (channel === "email") {
      const href = `mailto:${salon.email}?subject=${encodeURIComponent(
        `Reservation request — ${name}`,
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      setHandoff({ label: "Reopen email", href });
    } else if (channel === "phone") {
      setHandoff({ label: `Call ${salon.phone}`, href: salon.telHref! });
    }
    setStatus("success");
  }

  return (
    <section id="reserve" className="bg-warm-panel px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h2 className="font-display text-display-md italic text-ink">
            Reserve Your Visit.
          </h2>
          <p className="mx-auto mt-5 max-w-measure text-base text-ink-muted">
            {channel === "none"
              ? "Our reservation line is being published. Until it is, the front desk takes visits in person."
              : "Share your particulars and our front desk will confirm your visit."}
          </p>
        </div>

        <DeckleCard className="mt-12 p-8 sm:p-12">
          {channel === "none" ? (
            <div className="py-6 text-center">
              <p className="font-display text-2xl italic text-ink">
                Reservations by hand, for now.
              </p>
              <p className="mx-auto mt-4 max-w-measure text-sm leading-relaxed text-ink/70">
                {salon.name} hasn&rsquo;t published a phone number, WhatsApp line, or
                email yet, so a form here would collect your details and deliver them
                nowhere. The moment those are confirmed, this becomes a working
                reservation request.
              </p>
            </div>
          ) : status === "success" ? (
            <div className="py-8 text-center" role="status">
              <p className="font-display text-2xl italic text-ink">
                {channel === "phone"
                  ? "Your particulars are ready."
                  : "Your request is composed."}
              </p>
              <p className="mx-auto mt-4 max-w-measure text-sm leading-relaxed text-ink/70">
                {channel === "whatsapp" &&
                  "We've opened WhatsApp with your details written out — press send there and the front desk will confirm."}
                {channel === "email" &&
                  "We've opened your email app with the details written out — send it and the front desk will confirm."}
                {channel === "phone" &&
                  `We can't send it for you yet, so give the front desk a ring on ${salon.phone} and quote the details you entered.`}
              </p>
              {handoff && (
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <LinkButton href={handoff.href} variant="outline">
                    {handoff.label}
                  </LinkButton>
                  <ActionButton
                    variant="ghost"
                    onClick={() => {
                      setStatus("idle");
                      setHandoff(null);
                    }}
                  >
                    Start again
                  </ActionButton>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full Name" name="name" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={inputClass(!!errors.name)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </Field>
                <Field label="Phone Number" name="phone" error={errors.phone}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={inputClass(!!errors.phone)}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                </Field>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Service of Interest" name="service">
                  <select id="service" name="service" className={inputClass(false)}>
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Preferred Date" name="date">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className={inputClass(false)}
                  />
                </Field>
              </div>

              <Field label="Message (optional)" name="message">
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className={inputClass(false)}
                />
              </Field>

              <ActionButton type="submit" className="w-full">
                {channel === "whatsapp"
                  ? "Send via WhatsApp"
                  : channel === "email"
                    ? "Send by Email"
                    : "Prepare My Request"}
              </ActionButton>
              <p className="text-center text-meta uppercase text-ink-muted">
                {channel === "whatsapp"
                  ? "Opens WhatsApp with your details written out"
                  : channel === "email"
                    ? "Opens your email app with your details written out"
                    : "Your details are prepared for the call"}
              </p>
            </form>
          )}
        </DeckleCard>
      </div>
    </section>
  );
}

function inputClass(invalid: boolean) {
  return `w-full border-b bg-transparent px-1 py-2.5 text-ink placeholder:text-ink/30 transition-colors duration-300 focus:outline-none ${
    invalid ? "border-danger" : "border-ink/20 focus:border-gold-shadow"
  }`;
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-meta uppercase text-ink-muted">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
