/**
 * The salon's confirmed business facts, committed to the repository.
 *
 * Contact details are edited in /admin/settings and stored on the Settings
 * singleton, but that row shipped with placeholders ("Address to be confirmed",
 * "+91 00000 00000") which site-content.ts deliberately suppresses. These
 * constants are what it falls back to, so the landing page publishes the real
 * salon on any deploy without someone first retyping everything into the admin.
 * A real database value always wins — see `real()` in site-content.ts.
 *
 * The social profiles and the Google Maps listing have no Settings column at
 * all, so this file is their only home.
 *
 * Shared URLs from Google Maps, Instagram, YouTube and Facebook arrive carrying
 * per-session share tracking (entry/shh/lucs, igsh, si, mibextid). Those are
 * stripped here: they are personal to the device that produced them, and
 * schema.org sameAs expects canonical profile URLs. The Maps link keeps `ftid`,
 * Google's stable identifier for this listing.
 */

export type BusinessHour = {
  /** Rendered on the left of the Visit Us hours list. */
  day: string;
  /** Rendered on the right. */
  time: string;
  /** schema.org dayOfWeek — drives openingHoursSpecification. */
  days: string[];
  /** 24-hour "HH:MM", as schema.org requires. */
  opens: string;
  closes: string;
};

export const BUSINESS = {
  phone: "+91 99922 79292",
  whatsapp: "+91 99922 79292",
  addressLine:
    "Ch. Om Parkash Complex, Old Najafgarh Rd, Near Shiv Chowk, Jatwara Mohalla, Basant Vihar",
  city: "Bahadurgarh",
  state: "Haryana",
  postalCode: "124507",

  hours: [
    {
      day: "Monday — Sunday",
      time: "9:00 AM – 9:00 PM",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
  ] as BusinessHour[],

  mapsUrl:
    "https://maps.google.com/?q=Posh+Salon,+Ch.+Om+Parkash+Complex,+Old+Najafgarh+Rd,+Bahadurgarh,+Haryana+124507&ftid=0x390d0995deedf79f:0x18fffc379cf55948",

  /**
   * Source for the map iframe in Visit Us. Google's Maps Embed API needs a
   * billable key; this `?pb=` form does not. It is the URL that
   * `maps.google.com/maps?q=…&output=embed` redirects to — we point at the
   * destination rather than the redirect, because only the 301 hop carries
   * `x-frame-options: SAMEORIGIN`. The final response sets no framing headers.
   */
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m2!2m1!1sPosh+Salon,+Ch.+Om+Parkash+Complex,+Old+Najafgarh+Rd,+Bahadurgarh,+Haryana+124507",

  /** Where that embed geocodes to — also published as schema.org GeoCoordinates. */
  geo: { lat: 28.6887256, lng: 76.9326115 },

  social: {
    instagram: "https://www.instagram.com/posh_salon.bahadurgarh_",
    youtube: "https://www.youtube.com/@poshsalonbahadurgarh",
    facebook: "https://www.facebook.com/poshsalonbahadurgarh",
  },
} as const;
