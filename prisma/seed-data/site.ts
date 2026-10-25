import type { Download, GalleryItem, PartnerLogo, Settings, TimelineEntry } from "../../src/content/types";

// Unknown details stay as visible tokens until the company supplies them.
export const settings: Settings = {
  companyName: "Quality Steel and Metals",
  contactName: "Hemant Bansal & Mitesh Bansal",
  phone: "+91 92841 27584",
  whatsapp: "+91 92841 27584",
  email: "qualitysteelsmetals@yahoo.com",
  // Office only. The warehouse location is deliberately never stored for display.
  officeAddress: "Sanghvi Steel Compound, Gala Nos. 14, 15, 16 and 26",
  mapEmbedUrl: null,
  heroVideo: null,
};

// Only verified facts. Staff add further milestones in Phase 2.
export const timeline: TimelineEntry[] = [
  {
    year: "2002",
    title: "A beginning with Rs 500",
    body: "Hemant Bansal founded Quality Steel and Metals with Rs 500 and a commitment to supplying the right steel, honestly and on time.",
  },
  {
    year: "2009",
    title: "Our own premises",
    body: "The business moved into its own shop, a base for holding stock and serving customers directly.",
  },
  {
    year: "2013",
    title: "A dedicated warehouse",
    body: "A dedicated warehouse added space for a wider range of grades and sizes, ready to cut and dispatch.",
  },
  {
    year: "Today",
    title: "Importer, stockist, distributor and trader",
    body: "The company supplies tool steel, die steel, plastic mould steel and special alloy steel, with cutting, machining and grinding services to deliver material ready for use.",
  },
];

export const gallery: GalleryItem[] = [
  { id: "g1", label: "Steel stock racks", aspect: "portrait", shot: "Tall racks of round bars, shot from the aisle" },
  { id: "g2", label: "Bandsaw in operation", aspect: "landscape", shot: "Bandsaw mid-cut on a large block, sparks or coolant visible" },
  { id: "g3", label: "Bar ends close-up", aspect: "square", shot: "Bundle of bar ends with colour-coded grade markings" },
  { id: "g4", label: "Machined blocks", aspect: "landscape", shot: "Squared, milled blocks lined up on a table" },
  { id: "g5", label: "Material handling", aspect: "portrait", shot: "Crane or forklift lifting a heavy block" },
  { id: "g6", label: "Ground plate surface", aspect: "square", shot: "Raking light across a freshly ground plate" },
  { id: "g7", label: "Dispatch", aspect: "landscape", shot: "Packed and labelled material ready for dispatch" },
  { id: "g8", label: "Team at work", aspect: "portrait", shot: "Team member measuring a block with a vernier" },
];

// Customers confirmed by the owner. Logos in public/clients/ (Wikimedia Commons renders; Sandvik supplied by the client).
export const partners: PartnerLogo[] = [
  { name: "Maruti Suzuki", src: "/clients/maruti-suzuki.png" },
  { name: "Tata", src: "/clients/tata.png" },
  { name: "Mahindra", src: "/clients/mahindra.png" },
  { name: "Bhilai Steel Plant (SAIL)", src: "/clients/sail.png" },
  { name: "Sandvik Coromant", src: "/clients/sandvik.png" },
].map((c, i) => ({ id: `c${i + 1}`, ...c }));

// Shown on About only once real files are uploaded. Never placeholders.
export const certificates: Download[] = [];
export const brochure: Download | null = null;
