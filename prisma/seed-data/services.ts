import type { Service } from "../../src/content/types";

export const services: Service[] = [
  {
    slug: "bandsaw-cutting",
    name: "Bandsaw Cutting",
    summary: "Bars and blocks cut to length so you buy the size you need, not the full bar.",
    description: [
      "We cut round bars, flats and blocks from stock to the lengths on your order, so material arrives ready for the next operation.",
      "Cutting to size reduces your scrap, your handling and the machining time spent removing excess stock.",
    ],
    capabilities: ["Round bars", "Flat bars", "Blocks", "Cut-to-length orders"],
  },
  {
    slug: "precision-machining",
    name: "Precision Machining",
    summary: "Milled, squared blocks and plates delivered closer to final size.",
    description: [
      "Blocks and plates are milled and squared to your dimensions, so they arrive ready for your toolroom.",
      "Send a drawing with your enquiry and we will confirm what can be machined before quoting.",
    ],
    capabilities: ["Six-side milling", "Squaring", "Machining to drawing"],
  },
  {
    slug: "surface-grinding",
    name: "Surface Grinding",
    summary: "Flat, parallel ground surfaces for plates and blocks.",
    description: [
      "Surface grinding gives plates and blocks a flat, parallel finish for mould bases, die sets and precision parts.",
      "Share the required thickness and finish with your enquiry and we will advise on what is achievable.",
    ],
    capabilities: ["Plates", "Blocks", "Parallel faces", "Finish to drawing"],
  },
  {
    slug: "custom-cutting",
    name: "Custom Cutting",
    summary: "Material cut to your drawing or special requirements.",
    description: [
      "When standard sizes do not fit, we cut material to your drawing or specification.",
      "Upload a drawing or CAD file with your enquiry so we can review it and come back with options.",
    ],
    capabilities: ["Cutting to drawing", "Special sizes", "Batch orders"],
  },
];
