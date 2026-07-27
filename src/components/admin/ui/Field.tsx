import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

// Shared Operate form styling: bordered controls, gold-shadow focus, sharp corners.
export const controlClass =
  "h-10 w-full border border-warm-line bg-warm-white px-3 text-ui text-ink transition-colors duration-150 placeholder:text-ink-muted focus:border-gold-shadow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger";

/**
 * Label + control + hint/error. The control is handed `aria-invalid` and
 * `aria-describedby` automatically, so the message a sighted user sees in red is
 * the one a screen reader hears on the field itself.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const generatedId = useId();
  const messageId = `${htmlFor ?? generatedId}-message`;
  const message = error ?? hint;

  const control = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<Record<string, unknown>>, {
          "aria-invalid": error ? true : undefined,
          "aria-describedby": message ? messageId : undefined,
        })
      : child,
  );

  return (
    <div>
      <label htmlFor={htmlFor} className="text-meta uppercase text-ink-muted">
        {label}
        {required && (
          <>
            <span aria-hidden className="text-danger">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      <div className="mt-1.5">{control}</div>
      {message && (
        <p
          id={messageId}
          className={`mt-1 text-ui-sm ${error ? "text-danger" : "text-ink-muted"}`}
          {...(error ? { role: "alert" as const } : {})}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${controlClass} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${controlClass} h-auto py-2 ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...props }, ref) {
  return (
    <select ref={ref} className={`${controlClass} ${className}`} {...props}>
      {children}
    </select>
  );
});

/**
 * Checkbox plus its label — this markup was copied into six forms with slightly
 * different spacing each time.
 */
export function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2.5 text-ui text-ink">
        <input
          id={id}
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="h-4 w-4 shrink-0 accent-gold-shadow"
        />
        {label}
      </label>
      {hint && <p className="mt-1 pl-[26px] text-ui-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
