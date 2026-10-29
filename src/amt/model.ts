import type { AmtStatus } from "../data/amts";

export const TODAY = "2026-10-09";

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const fmt = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
};
export const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
export const mins = (t: string) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
/** Decimal hours, used inside events: "1,25 h" */
export const hD = (h: number) => String(Math.round(h * 100) / 100).replace(".", ",") + " h";
/** Clock-style hours, used in the Temps card: "10h30" */
export const hL = (h: number) => {
  const H = Math.floor(h + 1e-9);
  const M = Math.round((h - H) * 60);
  return M ? `${H}h${String(M).padStart(2, "0")}` : `${H}h`;
};
/** Duration in hours and minutes, used in the events list: "1h30min" */
export const hM = (h: number) => {
  const t = Math.round(h * 60);
  const H = Math.floor(t / 60), M = t % 60;
  return H ? (M ? `${H}h${M}min` : `${H}h`) : `${M}min`;
};
export const hm = (t: string) => t.replace(":", "h");

export const PEOPLE = ["PETIT Julie", "Dr MOREAU Claire", "FERRAND Hugo", "BENALI Karim", "LAMBERT Sophie", "CARON Inès"];
export const ROLES: Record<string, string> = {
  "PETIT Julie": "IPRP", "Dr MOREAU Claire": "Médecin du travail", "FERRAND Hugo": "Psychologue du travail",
  "BENALI Karim": "Ergonome", "LAMBERT Sophie": "ASST", "CARON Inès": "Assistante",
};
const PCOL = ["#0046da", "#a43fc4", "#08875f", "#b4520f", "#c42d76", "#3c4a73"];
export const ini = (n: string) => n.replace("Dr ", "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
export const pcol = (n: string) => PCOL[Math.max(0, PEOPLE.indexOf(n)) % PCOL.length];

export const AMT_STATUSES: AmtStatus[] = ["À faire", "En cours", "À valider", "Validé", "Terminé", "Suspendu", "Abandonné"];
export const STATUS_DOT: Record<AmtStatus, string> = {
  "À faire": "#e9792c", "En cours": "#d63a86", "À valider": "#a43fc4", "Validé": "#08875f",
  "Terminé": "#0046da", "Suspendu": "#5f6c96", "Abandonné": "#e22752",
};

export type EvKind = "inter" | "redac";
export type TimeCat = "inter" | "redac" | "trajet";
export type EvDisplayStatus = "prevu" | "acompleter" | "realise";

export const KINDS: Record<EvKind, string> = { inter: "Intervention", redac: "Rédaction" };
export const TCATS: { k: TimeCat; l: string; c: string }[] = [
  { k: "inter", l: "Intervention", c: "#5b74e8" },
  { k: "redac", l: "Rédaction, autre évènement", c: "#a43fc4" },
  { k: "trajet", l: "Trajet", c: "#f2a9c8" },
];
export const EST: Record<EvDisplayStatus, { l: string; bg: string; fg: string; dot: string }> = {
  prevu: { l: "Prévu", bg: "#eef0f6", fg: "#3c4a73", dot: "#5f6c96" },
  realise: { l: "Réalisé", bg: "#cbf4dd", fg: "#05613f", dot: "#08875f" },
  acompleter: { l: "À compléter", bg: "#fee7cc", fg: "#7a3b0c", dot: "#e9792c" },
};

export const ETIQUETTES = [
  "Thématique AMT / 3. Facteurs organisationnels, relationnels et éthiques / Risques psychosociaux",
  "Sous-thématique AMT / 3.3 Sensibilisation aux RPS",
  "Thématique AMT / 1. Risques physiques / Bruit",
  "Public / Encadrants",
  "Public / Ensemble des salariés",
];
export const etiqColor = (t: string) => (t.startsWith("Sous-") ? "#95c2a8" : t.startsWith("Thématique") ? "#c98ee0" : "#8fb3e8");

export interface FileRef { name: string; by: string; d: string; size: string }

/** One participant's occurrence of a rendez-vous: each participant has their own occurrence, with their own time */
export interface AmtEvent {
  id: string;
  /** Shared by every occurrence of the same rendez-vous */
  rdv: string;
  kind: EvKind;
  title: string;
  date: string;
  start: string;
  end: string;
  who: string; // the participant this occurrence belongs to
  /** Same for every occurrence of the rendez-vous (it is the agenda's slot) */
  plan: Record<TimeCat, number>;
  /** Raw input strings, empty = not entered */
  real: Partial<Record<TimeCat, string>>;
  report: string;
  reportFile: FileRef | null;
  /** Shown instead of the kind label, e.g. "Intervention en visio", "Autre type d’évènement" */
  typeLabel?: string;
  description?: string;
  address?: string;
  contact?: string;
  shared?: boolean;
  /** Travel details as entered in the form, so editing can show them again */
  trajets?: Partial<Record<"aller" | "retour", { mode: string; h: string; pt: string; min: string }>>;
}

export interface Issue { t: string; d: string }

/** Occurrences grouped by rendez-vous, in list order */
export const byRdv = (list: AmtEvent[]) => {
  const m = new Map<string, AmtEvent[]>();
  list.forEach((e) => m.set(e.rdv, [...(m.get(e.rdv) ?? []), e]));
  return [...m.values()];
};

/* ---------- Derived rules (SPECS §3, §4.3) ---------- */

export const isPast = (e: AmtEvent) => e.date <= TODAY;
export const isDone = isPast;
export const cats = (e: AmtEvent) => TCATS.filter((c) => e.kind !== "redac" || c.k === "redac");
export const hasReal = (e: AmtEvent, k: TimeCat) => {
  const r = e.real[k];
  return r !== undefined && r !== "" && !isNaN(parseFloat(r));
};
export const anyReal = (e: AmtEvent) => TCATS.some((c) => hasReal(e, c.k));
export const planOf = (e: AmtEvent, k: TimeCat) => e.plan[k] || 0;
/** RG-P2: real when entered, otherwise planned */
export const durOf = (e: AmtEvent, k: TimeCat) => (hasReal(e, k) ? parseFloat(e.real[k]!) : planOf(e, k));
export const planTotal = (e: AmtEvent) => TCATS.reduce((a, c) => a + planOf(e, c.k), 0);
export const curTotal = (e: AmtEvent) => TCATS.reduce((a, c) => a + durOf(e, c.k), 0);
export const hasReport = (e: AmtEvent) => !!e.report.trim() || !!e.reportFile;

export function issues(e: AmtEvent, echeance: string) {
  const errs: Issue[] = [];
  const warns: Issue[] = [];
  if (!isPast(e) && echeance && e.date > echeance)
    errs.push({ t: "Planifié après l’échéance", d: `L’évènement est prévu le ${fmt(e.date)}, après l’échéance de l’AMT (${fmt(echeance)}).` });
  if (isDone(e) && !anyReal(e))
    warns.push({ t: "À compléter", d: "L’évènement est passé : renseignez le temps réel (0 avec une note s’il n’a pas eu lieu)." });
  if (isDone(e) && e.kind === "redac" && !hasReport(e))
    warns.push({ t: "Compte rendu à écrire", d: "Le compte rendu est obligatoire pour une rédaction." });
  return { errs, warns };
}

export function displayStatus(e: AmtEvent, echeance: string): EvDisplayStatus {
  if (!isPast(e)) return "prevu";
  return issues(e, echeance).warns.length ? "acompleter" : "realise";
}

/* ---------- Seed data ---------- */

const ev = (p: Partial<AmtEvent> & Pick<AmtEvent, "id" | "kind" | "title" | "date" | "start" | "end" | "plan">): AmtEvent => ({
  who: "PETIT Julie", rdv: p.id, real: {}, report: "", reportFile: null, ...p,
});

export const SEED_EVENTS: AmtEvent[] = [
  ev({ id: "e1", kind: "redac", title: "Préparation du support", date: "2026-10-03", start: "10:00", end: "11:00",
    who: "Dr MOREAU Claire", plan: { inter: 0, redac: 1, trajet: 0 }, real: { redac: "1" },
    report: "Support de 18 diapositives : définitions, facteurs de risques, signaux faibles, ressources." }),
  ev({ id: "e2", kind: "inter", title: "Réunion de lancement avec l’employeur", date: "2026-10-09", start: "14:00", end: "16:00",
    plan: { inter: 2, redac: 0.5, trajet: 1 } }),
];

export const SEED_TASKS = [
  { t: "Analyse de la demande d’intervention", d: true },
  { t: "Échange avec l’employeur", d: true },
  { t: "Animation de la session de sensibilisation", d: false },
  { t: "Rédaction du compte rendu", d: false },
  { t: "Suivi des actions préconisées", d: false },
];

export interface HistEntry { d: string; time: string; by: string; text: string; from: string | null; to: string | null }

export const SEED_HIST: HistEntry[] = [
  { d: "2026-10-09", time: "16h20", by: "PETIT Julie", text: "Statut de l’AMT", from: "À faire", to: "En cours" },
  { d: "2026-10-09", time: "16h05", by: "PETIT Julie", text: "Évènement créé", from: null, to: "Réunion de lancement avec l’employeur" },
  { d: "2026-10-02", time: "11h05", by: "Dr MOREAU Claire", text: "Document ajouté", from: null, to: "support_sensibilisation_RPS.pdf" },
  { d: "2026-10-02", time: "11h03", by: "Dr MOREAU Claire", text: "Création de l’AMT", from: null, to: null },
];

export const fsize = (n: number) =>
  n >= 1048576 ? (n / 1048576).toFixed(1).replace(".", ",") + " Mo" : Math.max(1, Math.round(n / 1024)) + " Ko";
