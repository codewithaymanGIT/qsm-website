/** A stored image/file key as a URL: "/…" keys ship with the site (public/), others are uploads served by /files/. */
export const mediaHref = (key: string) => (key.startsWith("/") ? key : `/files/${key}`);
