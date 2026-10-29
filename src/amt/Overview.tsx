import { Bell, ChevronDown, Clock, Flag, ListChecks, Trash2 } from "lucide-react";
import { useState } from "react";
import type { AmtStatus } from "../data/amts";
import { AMT_STATUSES, EST, STATUS_DOT, TCATS, TODAY, days, fmt, hL, isDone, durOf, curTotal, planTotal, issues } from "./model";
import { ErrIcon, WarnIcon } from "./ui";
import { ME, type Amt } from "./useAmt";

export function Overview({ a }: { a: Amt }) {
  return (
    <div className="@container mt-5 grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-stretch gap-5">
      {/* Side by side (2×340 + gap), the left column takes the right column's height without adding to it */}
      <div className="flex max-h-[272px] min-w-0 flex-col gap-5 @min-[700px]:h-0 @min-[700px]:max-h-none @min-[700px]:min-h-full">
        <Notifications a={a} />
        <Tasks a={a} />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <Avancement a={a} />
        <Temps a={a} />
      </div>
    </div>
  );
}

/* §1 Notifications */
function Notifications({ a }: { a: Amt }) {
  let errN = 0;
  let warnN = 0;
  a.events.filter((e) => e.who === ME).forEach((e) => {
    const is = issues(e, a.echeance);
    errN += is.errs.length;
    if (is.warns.length) warnN++; // counts events, not warnings
  });
  if (!errN && !warnN) return null; // RG-N2
  return (
    <section aria-labelledby="h-alerts" className="flex min-w-0 flex-none flex-col gap-2.5 rounded-lg border border-stark-20 px-[18px] py-3.5">
      <h3 id="h-alerts" className="card-title"><Bell size={18} className="text-stark-120" />Notifications</h3>
      <div role="status" className="flex flex-wrap items-center gap-2">
        {errN > 0 && (
          <span className="inline-flex items-center gap-[5px] rounded-full bg-[#fde4ea] py-0.5 pr-2.5 pl-[7px] font-bold text-[#a3123f]">
            <ErrIcon size={15} />{errN > 1 ? `${errN} évènements sont prévus après l’échéance` : "Un évènement est prévu après l’échéance"}
          </span>
        )}
        {warnN > 0 && (
          <span className="inline-flex items-center gap-[5px] rounded-full bg-grimm-05 py-0.5 pr-2.5 pl-[7px] font-bold text-[#7a3b0c]">
            <WarnIcon size={15} />{`Des informations sont à compléter dans ${warnN} ${warnN > 1 ? "évènements" : "évènement"}`}
          </span>
        )}
      </div>
    </section>
  );
}

/* §2 Liste des tâches */
function Tasks({ a }: { a: Amt }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState(false);
  const done = a.tasks.filter((t) => t.d).length;
  const submit = () => {
    const v = draft.trim();
    if (!v) return setErr(true);
    a.addTask(v);
    setAdding(false);
    setDraft("");
  };
  const cancel = () => { setAdding(false); setDraft(""); setErr(false); };

  return (
    <section aria-labelledby="h-tasks" className="card min-h-0 flex-auto overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="h-tasks" className="card-title">
          <ListChecks size={18} className="text-stark-120" />Liste des tâches
          <span className="rounded bg-stark-05 px-1.5 text-[11px] font-semibold text-stark-120">{done} / {a.tasks.length} faites</span>
        </h3>
        {!adding && <button type="button" className="btn ml-auto" onClick={() => { setAdding(true); setErr(false); }}>Ajouter un élément</button>}
      </div>
      <ul tabIndex={0} aria-label="Tâches" className="-m-0.5 m-0 flex min-h-0 flex-auto list-none flex-col gap-1.5 overflow-y-auto p-0.5">
        {a.tasks.map((t, i) => (
          <li key={i} className="group flex items-start gap-2">
            <label className="inline-flex min-w-0 flex-1 cursor-pointer items-start gap-2">
              <input type="checkbox" checked={t.d} onChange={(e) => a.toggleTask(i, e.target.checked)} className="mt-0.5 h-4 w-4 accent-raven-100" />
              <span className={`font-semibold ${t.d ? "text-stark-100 line-through" : ""}`}>{t.t}</span>
            </label>
            <button type="button" aria-label={`Supprimer la tâche « ${t.t} »`} title="Supprimer" onClick={() => a.removeTask(i)}
              className="icon-btn h-6 w-6 text-allen-120 opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
      {adding && (
        <div className="flex flex-wrap items-center gap-2">
          <input autoFocus aria-label="Nouvelle tâche" placeholder="Saisir l’intitulé de la tâche" value={draft}
            onChange={(e) => { setDraft(e.target.value); setErr(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } if (e.key === "Escape") cancel(); }}
            className={`field h-8 min-w-0 flex-[1_1_200px] ${err ? "border-allen-100" : ""}`} />
          <button type="button" className="btnp" onClick={submit}>Ajouter</button>
          <button type="button" className="btn" onClick={cancel}>Annuler</button>
        </div>
      )}
    </section>
  );
}

/* §3 Avancement */
function Avancement({ a }: { a: Amt }) {
  const opened = a.amt.created.split("/").reverse().join("-");
  const [draft, setDraft] = useState(a.echeance);
  // Resync the field when the saved value changes (undo)
  const [saved, setSaved] = useState(a.echeance);
  if (saved !== a.echeance) { setSaved(a.echeance); setDraft(a.echeance); }
  // RG-P5: committed on blur, an emptied field goes back to the saved date
  const commit = () => {
    if (!draft) return setDraft(a.echeance);
    if (draft !== a.echeance) a.setEcheance(draft);
  };
  const dl = a.echeance ? days(TODAY, a.echeance) : null;
  const span = a.echeance ? days(opened, a.echeance) : 0;
  const pct = span > 0 ? Math.min(100, Math.max(0, (days(opened, TODAY) / span) * 100)) : a.echeance ? 100 : 0;

  return (
    <section aria-labelledby="h-prog" className="card">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="h-prog" className="card-title"><Flag size={18} className="text-stark-120" />Avancement</h3>
        <div className="relative ml-auto flex h-7 min-w-[150px] items-center gap-2 rounded-md border border-stark-40 bg-white px-2.5">
          <span className="h-2 w-2 flex-none rounded-full" style={{ background: STATUS_DOT[a.statut] }} />
          <select aria-label="Statut de l’AMT" value={a.statut} onChange={(e) => a.setStatut(e.target.value as AmtStatus)}
            className="h-full w-full cursor-pointer appearance-none border-0 bg-transparent pr-5 outline-none">
            {AMT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 text-stark-120" />
        </div>
      </div>
      <div role="progressbar" aria-label="Temps écoulé jusqu’à l’échéance" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-stark-20">
        <div className={`h-full rounded-full ${dl !== null && dl < 0 ? "bg-allen-100" : "bg-raven-100"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stark-120">
        <span>Ouverte le <b className="font-semibold text-stark-180">{fmt(opened)}</b></span>
        <label className="ml-auto inline-flex items-center gap-2">
          Échéance
          <input id="f-echeance" type="date" value={draft} min={opened} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setDraft(a.echeance); }}
            className="field h-7 text-xs text-stark-180" />
        </label>
      </div>
    </section>
  );
}

/* §4 Temps */
function Temps({ a }: { a: Amt }) {
  const cat = { inter: 0, redac: 0, trajet: 0 };
  let total = 0;
  a.events.filter(isDone).forEach((e) => {
    TCATS.forEach((c) => { cat[c.k] += durOf(e, c.k); });
    total += curTotal(e);
  });
  // Planned time of every upcoming occurrence, summed across participants
  const prevu = a.events.filter((e) => !isDone(e)).reduce((s, e) => s + planTotal(e), 0);
  const alloue = a.alloue;
  const over = total > alloue;
  const dispo = Math.max(alloue - total - prevu, 0);
  const base = Math.max(total + prevu, alloue, 0.001);
  const C = 2 * Math.PI * 42;
  let acc = 0;
  const segs = TCATS.map((c) => {
    const len = (cat[c.k] / base) * C;
    const s = { c: c.c, dash: `${len.toFixed(2)} ${(C - len).toFixed(2)}`, off: (-acc).toFixed(2) };
    acc += len;
    return s;
  });
  const prevuLen = (prevu / base) * C;
  segs.push({ c: EST.prevu.dot, dash: `${prevuLen.toFixed(2)} ${(C - prevuLen).toFixed(2)}`, off: (-acc).toFixed(2) });

  const [draft, setDraft] = useState(String(alloue));
  const [saved, setSaved] = useState(alloue);
  if (saved !== alloue) { setSaved(alloue); setDraft(String(alloue)); }
  const commit = () => {
    const v = parseFloat(draft.replace(",", "."));
    if (isNaN(v) || v < 0) return setDraft(String(alloue));
    if (v !== alloue) a.setAlloue(v);
  };

  return (
    <section aria-labelledby="h-dur" className="card">
      <h3 id="h-dur" className="card-title"><Clock size={18} className="text-stark-120" />Temps</h3>
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative h-[120px] w-[120px] flex-none">
          <svg viewBox="0 0 112 112" width="120" height="120" role="img"
            aria-label={`Temps passé ${hL(total)} sur ${hL(alloue)} alloués : ${TCATS.map((c) => `${c.l} ${hL(cat[c.k])}`).join(", ")}, prévu ${hL(prevu)}, disponible ${hL(dispo)}`}>
            <circle cx="56" cy="56" r="42" fill="none" stroke="var(--color-stark-20)" strokeWidth="14" />
            {segs.map((s) => (
              <circle key={s.c} cx="56" cy="56" r="42" fill="none" transform="rotate(-90 56 56)" stroke={s.c} strokeWidth="14" strokeDasharray={s.dash} strokeDashoffset={s.off} />
            ))}
          </svg>
          <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center leading-[1.15]">
            <span className="text-[10px] text-stark-120">Passé</span>
            <b className={`text-lg font-bold tabular-nums ${over ? "text-allen-120" : ""}`}>{hL(total)}</b>
            <span className="text-[10px] text-stark-120">sur {hL(alloue)}</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-[3px] text-xs">
          {TCATS.map((c) => (
            <div key={c.k} className="flex items-center gap-2">
              <i aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-sm" style={{ background: c.c }} />
              <span className="min-w-0 flex-1">{c.l}</span>
              <b className="font-semibold tabular-nums">{hL(cat[c.k])}</b>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <i aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-sm" style={{ background: EST.prevu.dot }} />
            <span className="min-w-0 flex-1">Prévu</span>
            <b className="font-semibold tabular-nums">{hL(prevu)}</b>
          </div>
          <div className="flex items-center gap-2">
            <i aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-sm border border-stark-40 bg-stark-20" />
            <span className="min-w-0 flex-1">Disponible</span>
            <b className="font-semibold tabular-nums">{hL(dispo)}</b>
          </div>
          {over && (
            <div className="flex items-center gap-2 font-semibold text-allen-120">
              <i aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-sm bg-allen-100" />
              <span className="min-w-0 flex-1">Dépassement</span>
              <b className="font-semibold tabular-nums">{hL(total - alloue)}</b>
            </div>
          )}
          <label className="mt-1 flex items-center gap-2 border-t border-stark-20 pt-2 text-stark-120">
            <span className="min-w-0 flex-1">Total temps alloué</span>
            <input inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setDraft(String(alloue)); }}
              className="field h-7 w-16 text-right text-xs font-semibold text-stark-180 tabular-nums" />
            <span>h</span>
          </label>
        </div>
      </div>
    </section>
  );
}
