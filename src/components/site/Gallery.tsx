/**
 * Reserved mounts for the salon's own photography. Four frames, not six: an
 * empty gallery should read as a held place, not as a wall of absence in the
 * middle of the page.
 */
function EmptyFrame({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden border border-warm-line bg-warm-panel/60 ${
        tall ? "min-h-[300px] sm:min-h-[420px]" : "min-h-[200px]"
      }`}
    >
      {/* Print-mount corners rather than a filled photo card. */}
      <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-gold/60" />
      <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold/60" />
      {/* Absolute, not `h-full`: a percentage height against a min-height-only
          parent resolves to auto and drops the caption to the top. */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="text-center text-meta uppercase text-ink-muted">
          Reserved for salon photography
        </p>
      </div>
    </div>
  );
}

export function Gallery() {
  return (
    <section id="gallery" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-display-md italic text-ink">The Album.</h2>
        <p className="mt-5 max-w-measure text-base leading-relaxed text-ink-muted">
          These frames are held for the salon&rsquo;s own photography and shown empty
          rather than filled with stock imagery.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="sm:row-span-2">
            <EmptyFrame tall />
          </div>
          <EmptyFrame />
          <EmptyFrame />
          <div className="sm:col-span-2">
            <EmptyFrame />
          </div>
        </div>
      </div>
    </section>
  );
}
