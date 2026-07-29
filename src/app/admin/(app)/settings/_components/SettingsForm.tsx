"use client";

import { useActionState, useEffect } from "react";
import { updateSettings } from "../actions";
import { Checkbox, Field, Input } from "@/components/admin/ui/Field";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export type SettingsData = {
  salonName: string;
  tagline: string;
  addressLine: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  gstNumber: string;
  gstRatePct: number;
  pricesIncludeGst: boolean;
  invoicePrefix: string;
};

export function SettingsForm({ settings }: { settings: SettingsData }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(updateSettings, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok && state.message) toast(state.message);
  }, [state, toast]);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action}>
      <PanelHeader
        title="Salon Information"
        description="Appears on invoices, the membership card, and the public site."
      />
      <div className="space-y-6 px-4 py-5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Salon Name" htmlFor="salonName" required error={fe.salonName}>
            <Input id="salonName" name="salonName" defaultValue={settings.salonName} />
          </Field>
          <Field label="Tagline" htmlFor="tagline">
            <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
          </Field>
          <Field label="Address" htmlFor="addressLine">
            <Input id="addressLine" name="addressLine" defaultValue={settings.addressLine} />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" defaultValue={settings.city} />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" defaultValue={settings.phone} />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp" hint="Used by the button on the public site">
            <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={settings.whatsapp} />
          </Field>
          <Field label="Email" htmlFor="email" error={fe.email}>
            <Input id="email" name="email" type="email" defaultValue={settings.email} />
          </Field>
        </div>

        <div className="border-t border-warm-line pt-6">
          <p className="text-meta uppercase text-ink-muted">Billing &amp; Tax</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <Field label="GST Number" htmlFor="gstNumber">
              <Input id="gstNumber" name="gstNumber" defaultValue={settings.gstNumber} />
            </Field>
            <Field label="GST Rate %" htmlFor="gstRatePct" error={fe.gstRatePct}>
              <Input
                id="gstRatePct"
                name="gstRatePct"
                type="number"
                step="0.01"
                min={0}
                defaultValue={settings.gstRatePct}
              />
            </Field>
            <Field
              label="Invoice Prefix"
              htmlFor="invoicePrefix"
              hint="e.g. POSH/26-27/00001"
              error={fe.invoicePrefix}
            >
              <Input
                id="invoicePrefix"
                name="invoicePrefix"
                defaultValue={settings.invoicePrefix}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Checkbox
              name="pricesIncludeGst"
              label="Prices already include GST"
              defaultChecked={settings.pricesIncludeGst}
              hint="When ticked, tax is extracted from the listed price instead of added to it."
            />
          </div>
        </div>

        {state.error && (
          <p className="text-ui-sm text-danger" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex justify-end">
          <SubmitButton pendingLabel="Saving…">Save Settings</SubmitButton>
        </div>
      </div>
    </form>
  );
}
