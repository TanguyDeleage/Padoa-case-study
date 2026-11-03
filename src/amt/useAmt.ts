import { useEffect, useRef, useState } from "react";
import type { AmtStatus, AmtSummary } from "../data/amts";
import { perimItems, type Perim } from "./perimeter";
import { PEOPLE, SEED_EVENTS, SEED_HIST, SEED_TASKS, TODAY, byRdv, clock, fmt, hL, type AmtEvent, type FileRef, type HistEntry } from "./model";

export const ME = "PETIT Julie";

export interface Info {
  type: string; demandeur: string; contact: string; contexte: string; description: string; conclusion: string;
  intervenants: string[]; etiquettes: string[]; maintien: boolean; rapport: boolean; eva: boolean;
}

interface Toast { msg: string; undo: (() => void) | null }

const fv = (v: unknown) => {
  if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return "—";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (Array.isArray(v)) return v.join(", ");
  const t = String(v);
  return t.length > 90 ? t.slice(0, 90) + "…" : t;
};

/** Everything the user can change in an AMT: kept by the app so it survives closing the dialog and feeds the list card */
export interface AmtState {
  statut: AmtStatus; echeance: string; alloue: number; tasks: typeof SEED_TASKS; events: AmtEvent[];
  hist: HistEntry[]; docs: FileRef[]; perim: Perim; info: Info;
}

export const seedState = (amt: AmtSummary): AmtState => ({
  statut: amt.status, echeance: "2026-11-15", alloue: 20, tasks: SEED_TASKS, events: SEED_EVENTS, hist: SEED_HIST,
  docs: [{ name: "support_sensibilisation_RPS.pdf", by: "Dr MOREAU Claire", d: "2026-10-02", size: "1,4 Mo" }],
  perim: { kind: "adh", ids: [amt.companyCode] },
  info: {
    type: "RPS", demandeur: "Dr MOREAU Claire", contact: "GIRARD Paul, gérant", contexte: "",
    description: "Demande de l’employeur suite à plusieurs arrêts de travail dans l’équipe de montage. Objectif : sensibiliser les encadrants et les salariés aux facteurs de risques psychosociaux et proposer des pistes d’actions.",
    conclusion: "", intervenants: ["PETIT Julie", "Dr MOREAU Claire", "FERRAND Hugo"],
    etiquettes: ["Thématique AMT / 3. Facteurs organisationnels, relationnels et éthiques / Risques psychosociaux", "Sous-thématique AMT / 3.3 Sensibilisation aux RPS"],
    maintien: false, rapport: false, eva: false,
  },
});

/** The list card's view of an AMT's content (RG-C3: report files count as documents; one event per rendez-vous) */
export const summarize = (amt: AmtSummary, s: AmtState): AmtSummary => ({
  ...amt,
  status: s.statut,
  intervenants: s.info.intervenants.slice(0, 2),
  extraIntervenants: Math.max(0, s.info.intervenants.length - 2),
  hasEvent: s.events.length > 0,
  counts: {
    ...amt.counts,
    files: s.docs.length + s.events.filter((e) => e.reportFile).length,
    events: byRdv(s.events).length,
  },
});

export function useAmt(amt: AmtSummary, init: AmtState, onChange: (id: number, s: AmtState) => void) {
  const [statut, setStatutRaw] = useState(init.statut);
  const [echeance, setEcheanceRaw] = useState(init.echeance);
  const [alloue, setAlloueRaw] = useState(init.alloue);
  const [tasks, setTasks] = useState(init.tasks);
  const [events, setEvents] = useState(init.events);
  const [hist, setHist] = useState(init.hist);
  const [docs, setDocs] = useState(init.docs);
  const [perim, setPerimRaw] = useState(init.perim);
  const [info, setInfoState] = useState(init.info);
  // onChange must be stable (it is a dependency)
  useEffect(() => {
    onChange(amt.id, { statut, echeance, alloue, tasks, events, hist, docs, perim, info });
  }, [onChange, amt.id, statut, echeance, alloue, tasks, events, hist, docs, perim, info]);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const prev = useRef<Record<string, string>>({});

  const flash = (msg: string, undo?: () => void) => {
    setToast({ msg, undo: undo || null });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 6000);
  };
  const log = (text: string, from: string | null = null, to: string | null = null) => {
    setHist((h) => [{ d: TODAY, time: clock(), by: ME, text, from, to }, ...h]);
  };
  const undo = () => {
    toast?.undo?.();
    log("Dernière modification annulée");
    setToast({ msg: "Modification annulée", undo: null });
  };

  /* Events */
  const getE = (id: string) => events.find((e) => e.id === id)!;
  const updE = (id: string, patch: Partial<AmtEvent>) =>
    setEvents((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  /** Snapshot-based undo for any change on the events list. Event participants join the AMT's intervenants (RG-C2) */
  const changeEvents = (next: (list: AmtEvent[]) => AmtEvent[], msg: string, logArgs: [string, string | null, string | null]) => {
    const snapshot = events;
    const list = next(events);
    setEvents(list);
    log(...logArgs);
    const old = info.intervenants;
    const joined = [...new Set(list.map((e) => e.who))].filter((p) => !old.includes(p));
    if (joined.length) {
      setInfo("intervenants", PEOPLE.filter((p) => old.includes(p) || joined.includes(p)));
      joined.forEach((p) => log("Intervenant ajouté", null, p));
    }
    flash(msg, () => { setEvents(snapshot); setInfo("intervenants", old); });
  };

  /* Info fields: text fields log on blur, selects/switches immediately */
  const setInfo = <K extends keyof Info>(k: K, v: Info[K]) => setInfoState((s) => ({ ...s, [k]: v }));
  const focusField = (k: keyof Info) => { prev.current[k] = JSON.stringify(info[k]); };
  const blurField = (k: keyof Info, label: string) => {
    const p = prev.current[k];
    delete prev.current[k];
    if (p === undefined || p === JSON.stringify(info[k])) return;
    const old = JSON.parse(p);
    log(`Champ « ${label} » modifié`, fv(old), fv(info[k]));
    flash(`${label} enregistré`, () => setInfo(k, old));
  };
  const setInfoNow = <K extends keyof Info>(k: K, v: Info[K], label: string, logText?: [string, string | null, string | null]) => {
    const old = info[k];
    setInfo(k, v);
    if (logText) log(...logText);
    else log(`Champ « ${label} » modifié`, fv(old), fv(v));
    flash(`${label} enregistré`, () => setInfo(k, old));
  };

  return {
    amt, statut, echeance, alloue, tasks, events, hist, docs, perim, info, toast, prev,
    flash, log, undo, getE, updE, changeEvents, setInfo, focusField, blurField, setInfoNow,

    setStatut: (v: AmtStatus) => {
      const old = statut;
      setStatutRaw(v);
      log("Statut de l’AMT", old, v);
      flash("Statut modifié", () => setStatutRaw(old));
    },
    setEcheance: (v: string) => {
      const old = echeance;
      setEcheanceRaw(v);
      log("Date d’échéance", old ? fmt(old) : "—", fmt(v));
      flash(old ? "Date d’échéance modifiée" : "Date d’échéance ajoutée", () => setEcheanceRaw(old));
    },
    setAlloue: (v: number) => {
      const old = alloue;
      setAlloueRaw(v);
      log("Temps alloué", hL(old), hL(v));
      flash("Temps alloué modifié", () => setAlloueRaw(old));
    },

    addTask: (t: string) => {
      setTasks((l) => [...l, { t, d: false }]);
      log("Tâche ajoutée", null, t);
      flash("Tâche ajoutée");
    },
    toggleTask: (i: number, d: boolean) => {
      const t = tasks[i].t;
      setTasks((l) => l.map((x, j) => (j === i ? { ...x, d } : x)));
      log(d ? `Tâche cochée comme faite : « ${t} »` : `Tâche rouverte : « ${t} »`, d ? "À faire" : "Faite", d ? "Faite" : "À faire");
    },
    removeTask: (i: number) => {
      const snapshot = tasks;
      setTasks((l) => l.filter((_, j) => j !== i));
      log(`Tâche supprimée : « ${snapshot[i].t} »`);
      flash("Tâche supprimée", () => setTasks(snapshot));
    },

    addDocs: (added: FileRef[]) => {
      setDocs((d) => [...added, ...d]);
      added.forEach((a) => log("Document ajouté", null, a.name));
      flash(added.length > 1 ? `${added.length} documents ajoutés` : "Document ajouté");
    },
    removeDoc: (i: number) => {
      const snapshot = docs;
      setDocs((d) => d.filter((_, j) => j !== i));
      log("Document retiré", snapshot[i].name, null);
      flash("Document retiré", () => setDocs(snapshot));
    },

    setPerim: (next: Perim) => {
      const old = perim;
      if (old.kind === next.kind && old.ids.join() === next.ids.join()) return;
      const names = (p: Perim) => perimItems(amt, p).map((o) => o.name).join(", ");
      setPerimRaw(next);
      log("Périmètre modifié", names(old), names(next));
      flash("Périmètre mis à jour", () => setPerimRaw(old));
    },
  };
}

export type Amt = ReturnType<typeof useAmt>;
