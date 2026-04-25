import { Material } from "../types";

export const materials: Material[] = [
  { name: "3mm MDF", thickness: "3mm", cut: true, engrave: true, power: [55, 70], speed: [16, 25], risks: ["charring", "smoke staining", "incomplete cut"] },
  { name: "6mm MDF", thickness: "6mm", cut: true, engrave: true, power: [70, 90], speed: [8, 14], risks: ["multiple passes", "edge burn"] },
  { name: "3mm Acrylic", thickness: "3mm", cut: true, engrave: true, power: [60, 78], speed: [10, 18], risks: ["melting", "warping"] },
  { name: "Genuine Leather", thickness: "1.5-3mm", cut: true, engrave: true, power: [28, 45], speed: [35, 55], risks: ["burning", "smell"] },
  { name: "Glass", thickness: "engrave only", cut: false, engrave: true, power: [18, 35], speed: [60, 85], risks: ["cracking"] },
  { name: "Metal", thickness: "not supported", cut: false, engrave: false, power: [0, 0], speed: [0, 0], risks: ["Not supported"] }
];
