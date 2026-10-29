export type AmtStatus = "À faire" | "En cours" | "À valider" | "Validé" | "Terminé" | "Suspendu" | "Abandonné";

export interface AmtSummary {
  id: number;
  title: string;
  type: string;
  company: string;
  companyCode: string;
  sector: string;
  employee?: string;
  eff: number;
  intervenants: string[];
  extraIntervenants?: number;
  created: string;
  status: AmtStatus;
  ai?: number;
  hasEvent?: boolean;
  hasPrevention?: boolean;
  counts: { calls: number; comments: number; files: number; events: number };
}

// Same cast as the dialog demo data: #41 is the AMT detailed in the reference artifact, newest first
export const AMTS: AmtSummary[] = [
  {
    id: 41, title: "Sensibilisation aux risques psychosociaux", type: "RPS",
    company: "Atelier Lumière SARL", companyCode: "A10294", sector: "Fabrication d'appareils d'éclairage",
    eff: 42, intervenants: ["PETIT Julie", "Dr MOREAU Claire"], extraIntervenants: 1, created: "02/10/2026", status: "En cours",
    hasEvent: true, hasPrevention: true, counts: { calls: 1, comments: 0, files: 1, events: 6 },
  },
  {
    id: 40, title: "10.2 Etude de poste inaptitude", type: "Etude de poste",
    company: "Menuiserie Lefort", companyCode: "L12640", sector: "Fabrication de charpentes et de menuiseries", employee: "GALLAGHER Jean-Baptiste",
    eff: 18, intervenants: ["BENALI Karim", "Dr MOREAU Claire"], created: "29/09/2026", status: "À faire",
    counts: { calls: 0, comments: 2, files: 0, events: 0 },
  },
  {
    id: 39, title: "Echange employeur - inaptitude", type: "Maintien en emploi",
    company: "Atelier Lumière SARL", companyCode: "A10294", sector: "Fabrication d'appareils d'éclairage", employee: "RAYMOND Laurence",
    eff: 42, intervenants: ["Dr MOREAU Claire", "LAMBERT Sophie"], created: "25/09/2026", status: "En cours",
    ai: 1, hasEvent: true, counts: { calls: 1, comments: 1, files: 1, events: 2 },
  },
  {
    id: 38, title: "02.4 Mesurage du bruit", type: "Bruit",
    company: "Imprimerie Nouvelle", companyCode: "I90512", sector: "Imprimerie de labeurs",
    eff: 27, intervenants: ["BENALI Karim"], created: "22/09/2026", status: "À valider",
    ai: 2, hasEvent: true, hasPrevention: true, counts: { calls: 0, comments: 2, files: 3, events: 2 },
  },
  {
    id: 37, title: "01.3 Mise à jour FE", type: "Fiche d'entreprise",
    company: "Ferronnerie Duval", companyCode: "F61290", sector: "Travaux de serrurerie et de métallerie",
    eff: 9, intervenants: ["PETIT Julie", "CARON Inès"], created: "17/09/2026", status: "Validé",
    counts: { calls: 1, comments: 0, files: 2, events: 1 },
  },
  {
    id: 36, title: "04.1 Etude ergonomique de poste", type: "Ergonomie",
    company: "Garage Central Mehun", companyCode: "G70345", sector: "Entretien et réparation de véhicules automobiles", employee: "MARCHAND Kevin",
    eff: 6, intervenants: ["BENALI Karim", "PETIT Julie"], created: "10/09/2026", status: "En cours",
    ai: 1, hasEvent: true, counts: { calls: 0, comments: 3, files: 1, events: 2 },
  },
  {
    id: 35, title: "05.2 Évaluation du risque chimique", type: "Risque chimique",
    company: "Imprimerie Nouvelle", companyCode: "I90512", sector: "Imprimerie de labeurs",
    eff: 27, intervenants: ["LAMBERT Sophie", "Dr MOREAU Claire"], created: "03/09/2026", status: "Validé",
    hasPrevention: true, counts: { calls: 0, comments: 1, files: 4, events: 3 },
  },
];

export const STATUS_STYLE: Record<AmtStatus, { bg: string; fg: string; dot: string }> = {
  "À faire": { bg: "#fee7cc", fg: "#7a3b0c", dot: "#e9792c" },
  "En cours": { bg: "#dbedff", fg: "#0036bb", dot: "#d63a86" },
  "À valider": { bg: "#f9e3ff", fg: "#6d2385", dot: "#a43fc4" },
  "Validé": { bg: "#cbf4dd", fg: "#05613f", dot: "#08875f" },
  "Terminé": { bg: "#dbedff", fg: "#0036bb", dot: "#0046da" },
  "Suspendu": { bg: "#f3f5f9", fg: "#3c4a73", dot: "#5f6c96" },
  "Abandonné": { bg: "#ffe5e3", fg: "#c21c52", dot: "#e22752" },
};
