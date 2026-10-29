import { CalendarDays, ChevronDown, Eye, FileText, MoreVertical, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import {
  EST, KINDS, TODAY, byRdv, cats, curTotal, displayStatus, fmt, fsize, hD, hM, hasReal, hasReport, hm, isDone, isPast,
  issues, planOf, planTotal, type AmtEvent, type EvDisplayStatus, type TimeCat,
} from "./model";
import { AvatarStack, Backdrop, ErrIcon, Tooltip, WarnIcon } from "./ui";
import { ME, type Amt } from "./useAmt";

const COLS = "grid grid-cols-[20px_140px_minmax(200px,1fr)_96px_96px_136px_64px] gap-x-3 items-center px-3";

/** A rendez-vous as seen by the connected user: their own occurrence, or the most behind one when they don't take part */
type Item = { kind: "event"; e: AmtEvent; mine: boolean; people: string[] } | { kind: "today" } | { kind: "due" };
const RANK: Record<EvDisplayStatus, number> = { prevu: 0, realise: 1, acompleter: 2 };

export function EventsSection({ a, onAdd, onEdit }: { a: Amt; onAdd: (anchor: HTMLElement) => void; onEdit: (e: AmtEvent) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [kebab, setKebab] = useState<string | null>(null);

  // One row per rendez-vous, the connected user first among the participants
  const rows = byRdv(a.events).map((g) => {
    const own = g.find((e) => e.who === ME);
    const e = own ?? g.reduce((w, x) => (RANK[displayStatus(x, a.echeance)] > RANK[displayStatus(w, a.echeance)] ? x : w));
    const people = g.map((x) => x.who).sort((x, y) => (x === ME ? -1 : y === ME ? 1 : 0));
    return { kind: "event" as const, e, mine: !!own, people };
  });

  // RG-E1: from furthest to oldest; RG-E2: markers at their chronological place
  const sorted = rows.sort(({ e: x }, { e: y }) => (x.date !== y.date ? (x.date > y.date ? -1 : 1) : x.start > y.start ? -1 : 1));
  const markers: { d: string; item: Item }[] = [{ d: TODAY, item: { kind: "today" } }];
  if (a.echeance) markers.push({ d: a.echeance, item: { kind: "due" } });
  markers.sort((x, y) => (x.d > y.d ? -1 : 1));
  const items: Item[] = [];
  sorted.forEach((row) => {
    while (markers.length && markers[0].d >= row.e.date) items.push(markers.shift()!.item);
    items.push(row);
  });
  markers.forEach((m) => items.push(m.item));

  return (
    <section aria-labelledby="h-ev" className="mt-6 flex flex-none flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="h-ev" className="card-title"><CalendarDays size={18} className="text-stark-120" />Évènements</h3>
        <button type="button" className="btn text-raven-100 hover:text-raven-120" aria-haspopup="menu" onClick={(ev) => onAdd(ev.currentTarget)}><Plus size={14} />Ajouter un évènement<ChevronDown size={14} /></button>
      </div>
      {/* RG-E16: never taller than the visible main column (close bar 32 + header 56 + paddings 48 + title row 44) */}
      <div className="max-h-[calc(100dvh-180px)] overflow-auto rounded-lg border border-stark-20">
        <div role="table" aria-label="Évènements" className="min-w-[860px]">
          <div role="row" className={`${COLS} sticky top-0 z-10 h-[38px] border-b border-stark-20 bg-stark-05 text-xs font-semibold text-stark-120`}>
            <span role="columnheader"><span className="sr-only">Alertes</span></span>
            <span role="columnheader">Date</span>
            <span role="columnheader">Évènement</span>
            <span role="columnheader">Intervenants</span>
            <span role="columnheader">Temps</span>
            <span role="columnheader">Statut</span>
            <span role="columnheader"><span className="sr-only">Actions</span></span>
          </div>
          {items.map((it) => {
            if (it.kind === "today")
              return (
                <div key="today" role="row" className="border-b border-stark-20 bg-[#f5f8ff] px-3 py-1.5 text-xs text-raven-100">
                  Aujourd’hui · {fmt(TODAY)}
                </div>
              );
            if (it.kind === "due")
              return (
                <div key="due" role="row" className="border-b border-stark-20 bg-[#fff6f5] px-3 py-1.5 text-xs text-allen-120">
                  Date d’échéance · {fmt(a.echeance)}
                </div>
              );
            const e = it.e;
            return (
              <EventRow key={e.rdv} a={a} e={e} mine={it.mine} people={it.people} open={!!open[e.rdv]} toggle={() => setOpen((o) => ({ ...o, [e.rdv]: !o[e.rdv] }))}
                kebabOpen={kebab === e.rdv} setKebab={(v) => setKebab(v ? e.rdv : null)} onEdit={() => { setKebab(null); onEdit(e); }} />
            );
          })}
          {!a.events.length && <div className="p-6 text-center text-stark-120">Aucun évènement.</div>}
        </div>
      </div>
    </section>
  );
}

function EventRow({ a, e, mine, people, open, toggle, kebabOpen, setKebab, onEdit }: {
  a: Amt; e: AmtEvent; mine: boolean; people: string[]; open: boolean; toggle: () => void; kebabOpen: boolean; setKebab: (v: boolean) => void; onEdit: () => void;
}) {
  const ds = displayStatus(e, a.echeance);
  const st = EST[ds];
  const iss = issues(e, a.echeance);
  const issueL = [...iss.errs, ...iss.warns].map((m) => m.t).join(" · ");
  const done = isDone(e);
  const planT = planTotal(e);
  const curT = curTotal(e);

  const del = () => {
    setKebab(false);
    a.changeEvents((l) => l.filter((x) => x.rdv !== e.rdv),
      `Évènement « ${e.title} » supprimé`, ["Évènement supprimé", `${e.title} (${fmt(e.date)})`, null]);
  };

  return (
    <div className={`border-b border-stark-20 ${open ? "bg-[#fbfcfe]" : "bg-white"}`}>
      <div role="row" className={`${COLS} min-h-14 cursor-pointer py-2 ${open ? "" : "hover:bg-stark-05"}`} onClick={toggle}>
        <span role="cell" className="flex items-center">
          {iss.errs.length > 0 ? (
            <span role="img" aria-label={`Erreur : ${issueL}`} title={issueL}><ErrIcon /></span>
          ) : iss.warns.length > 0 ? (
            <span role="img" aria-label={`Avertissement : ${issueL}`} title={issueL}><WarnIcon /></span>
          ) : null}
        </span>
        <span role="cell" className="flex flex-col leading-[1.35] tabular-nums">
          <span className={`text-sm font-semibold ${iss.errs.length ? "text-allen-120" : ""}`}>{fmt(e.date)}</span>
          <span className="text-xs text-stark-120">{hm(e.start)} – {hm(e.end)}</span>
        </span>
        <span role="cell" className="min-w-0">
          <div className="truncate font-semibold">{e.title}</div>
          <div className="text-xs text-stark-120">{e.typeLabel ?? KINDS[e.kind]}</div>
        </span>
        <span role="cell" className="flex" aria-label={`Intervenants : ${people.join(", ")}`}><AvatarStack names={people} /></span>
        <span role="cell" className="text-xs font-semibold tabular-nums text-stark-120">
          {/* Others' real time is theirs: a non-participant only sees the shared planned time */}
          {mine && ds === "realise" ? `Réel ${hM(curT)}` : !mine || ds === "prevu" ? `Prévu ${hM(planT)}` : null}
        </span>
        <span role="cell" className="min-w-0">
          <span className="inline-flex h-7 max-w-full items-center gap-2 rounded-full px-2.5 text-xs font-bold" style={{ background: st.bg, color: st.fg }}>
            <i aria-hidden="true" className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: st.dot }} />
            <span className="truncate">{st.l}</span>
          </span>
        </span>
        <span role="cell" className="flex items-center justify-end gap-1.5" onClick={(ev) => ev.stopPropagation()}>
          {mine && hasReport(e) && <FileText size={15} className="text-raven-100" aria-label="Compte rendu rédigé" />}
          <span className="relative inline-flex">
            <button type="button" className="icon-btn" aria-label={`Actions sur « ${e.title} »`} aria-haspopup="menu" aria-expanded={kebabOpen} onClick={() => setKebab(!kebabOpen)}>
              <MoreVertical size={16} />
            </button>
            {kebabOpen && (
              <>
                <Backdrop onClose={() => setKebab(false)} />
                <div role="menu" className="menu top-[-6px] right-[34px]">
                  <button type="button" role="menuitem" className="menuitem font-semibold" onClick={onEdit}><Pencil size={15} />Modifier l’évènement</button>
                  {!done && <button type="button" role="menuitem" className="menuitem font-semibold text-allen-120" onClick={del}><Trash2 size={15} />Supprimer l’évènement</button>}
                </div>
              </>
            )}
          </span>
          <button type="button" className="icon-btn" aria-expanded={open} aria-label={`${open ? "Replier" : "Déplier"} ${e.title}`} onClick={toggle}>
            <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </span>
      </div>
      {open && (mine ? <EventDetail a={a} e={e} n={people.length} /> : (
        <div className="flex max-w-[1100px] flex-col gap-3 pr-5 pb-[18px] pl-[196px]">
          <TimeTable a={a} e={e} n={people.length} readOnly />
        </div>
      ))}
    </div>
  );
}

function EventDetail({ a, e, n }: { a: Amt; e: AmtEvent; n: number }) {
  const iss = issues(e, a.echeance);
  return (
    <div className="flex max-w-[1100px] flex-col gap-3 pr-5 pb-[18px] pl-[196px]">
      {(iss.errs.length > 0 || iss.warns.length > 0) && (
        <div role="list" aria-label="Points d’attention" className="flex flex-col gap-1.5">
          {iss.errs.map((m) => (
            <div key={m.t} role="listitem" className="flex items-start gap-2.5 rounded-md border border-l-4 border-[#f7b9c6] border-l-allen-100 bg-[#fff6f5] px-3 py-2.5">
              <ErrIcon /><div className="leading-[1.45]"><b className="font-bold text-[#a3123f]">Erreur · {m.t}</b> <span className="text-stark-120">— {m.d}</span></div>
            </div>
          ))}
          {iss.warns.map((m) => (
            <div key={m.t} role="listitem" className="flex items-start gap-2.5 rounded-md border border-l-4 border-[#f6c89a] border-l-grimm-100 bg-[#fff4e6] px-3 py-2.5">
              <WarnIcon /><div className="leading-[1.45]"><b className="font-bold text-[#7a3b0c]">{m.t}</b> <span className="text-stark-120">— {m.d}</span></div>
            </div>
          ))}
        </div>
      )}
      <TimeTable a={a} e={e} n={n} />
      <Report a={a} e={e} />
    </div>
  );
}

/* §4.4 b — times, in decimal hours by 0.25 steps. Planned time is shared by the rendez-vous, real time is the user's own */
function TimeTable({ a, e, n, readOnly = false }: { a: Amt; e: AmtEvent; n: number; readOnly?: boolean }) {
  const planT = planTotal(e);
  const curT = curTotal(e);
  const totDelta = Math.round((curT - planT) * 100) / 100;
  const anyR = cats(e).some((c) => hasReal(e, c.k));
  const future = !isPast(e);
  const rowCls = `grid ${readOnly ? "grid-cols-[minmax(0,1fr)_120px]" : "grid-cols-[minmax(0,1fr)_120px_150px]"} gap-x-3 items-center px-3`;

  const commitPlan = (k: TimeCat, label: string, raw: string) => {
    const v = parseFloat(raw);
    const next = isNaN(v) ? 0 : v;
    const old = planOf(e, k);
    if (next === old) return;
    a.changeEvents((l) => l.map((x) => (x.rdv === e.rdv ? { ...x, plan: { ...x.plan, [k]: next } } : x)),
      `${label} : temps prévu enregistré`, [`${label} · temps prévu de « ${e.title} »`, hD(old), hD(next)]);
  };
  const commitReal = (k: TimeCat, label: string, raw: string) => {
    const old = e.real[k] || "";
    if (raw === old) return;
    const wasMissing = isDone(e) && !anyR;
    const a1 = parseFloat(old);
    const b1 = parseFloat(raw);
    a.changeEvents((l) => l.map((x) => (x.id === e.id ? { ...x, real: { ...x.real, [k]: raw } } : x)),
      `${label} : temps réel enregistré${wasMissing && raw ? " · évènement réalisé" : ""} · temps passé mis à jour`,
      [`${label} · temps réel de « ${e.title} »`, isNaN(a1) ? "—" : hD(a1), isNaN(b1) ? "—" : hD(b1)]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold">{isPast(e) ? "Temps passé" : "Temps prévu"}</span>
      <div role="table" aria-label="Temps de l’évènement, en heures" className="max-w-[520px] overflow-hidden rounded-md border border-stark-20 bg-white">
        <div role="row" className={`${rowCls} h-[34px] border-b border-stark-20 bg-stark-05 text-xs font-semibold text-stark-120`}>
          <span role="columnheader">Catégorie</span><span role="columnheader">Prévu (h)</span>{!readOnly && <span role="columnheader">Mon réel (h)</span>}
        </div>
        {cats(e).map((c) => {
          const p = planOf(e, c.k);
          const has = hasReal(e, c.k);
          const d = has ? Math.round((parseFloat(e.real[c.k]!) - p) * 100) / 100 : 0;
          return (
            <div key={c.k} role="row" className={`${rowCls} min-h-[42px] border-b border-stark-20 py-1`}>
              <span role="cell" className="flex items-center gap-2"><i aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-sm" style={{ background: c.c }} />{c.l}</span>
              <span role="cell" className={readOnly ? "pl-[5px] tabular-nums" : ""}>
                {readOnly ? hD(p) : <HoursInput key={`p${p}`} value={String(Math.round(p * 100) / 100)} aria={`${c.l} : temps prévu en heures`} onCommit={(v) => commitPlan(c.k, c.l, v)} />}
              </span>
              {!readOnly && <span role="cell" className="flex min-w-0 items-center gap-1.5">
                {future ? (
                  <Tooltip text={"L’évènement n’a pas encore eu lieu :\nvotre temps réel ne peut pas être saisi."}>
                    <HoursInput value="" aria={`${c.l} : temps réel en heures, saisie possible une fois l’évènement passé`} onCommit={() => {}} disabled />
                  </Tooltip>
                ) : (
                  <HoursInput key={`r${e.real[c.k] ?? ""}`} value={e.real[c.k] || ""} aria={`${c.l} : temps réel en heures`} onCommit={(v) => commitReal(c.k, c.l, v)}
                    className={`font-bold ${d !== 0 ? "text-raven-100" : ""}`} />
                )}
                {d !== 0 && (
                  <span className="rounded bg-raven-05 px-[5px] text-[11px] font-bold whitespace-nowrap text-raven-100">
                    {d > 0 ? "+" : "−"}{hD(Math.abs(d))}
                  </span>
                )}
              </span>}
            </div>
          );
        })}
        <div role="row" className={`${rowCls} min-h-[38px] bg-[#fbfcfe] py-1 font-bold tabular-nums`}>
          <span role="cell">Total</span>
          <span role="cell" className="pl-[5px]">{hD(planT)}</span>
          {!readOnly && <span role="cell" className={`flex min-w-0 items-center gap-1.5 pl-[5px] ${anyR && totDelta !== 0 ? "text-raven-100" : ""}`}>
            {anyR ? hD(curT) : "—"}
            {anyR && totDelta !== 0 && (
              <span className="rounded bg-raven-05 px-[5px] text-[11px] font-bold whitespace-nowrap text-raven-100">
                {totDelta > 0 ? "+" : "−"}{hD(Math.abs(totDelta))}
              </span>
            )}
          </span>}
        </div>
      </div>
      {readOnly ? (
        <span className="text-xs text-stark-120">Vous ne participez pas à cet évènement : chaque participant renseigne son propre temps réel.</span>
      ) : n > 1 && (
        <span className="text-xs text-stark-120">Temps prévu commun aux {n} participants · le temps réel est propre à chacun.</span>
      )}
    </div>
  );
}

/** Number field that keeps its own draft while typing and commits on blur / Enter (arrows step natively by 0.25) */
function HoursInput({ value, aria, onCommit, className = "", disabled = false }: { value: string; aria: string; onCommit: (v: string) => void; className?: string; disabled?: boolean }) {
  const [draft, setDraft] = useState(value);
  return (
    <input type="number" min={0} step={0.25} aria-label={aria} value={draft} className={`cell ${className}`} disabled={disabled}
      onChange={(ev) => setDraft(ev.target.value)} onBlur={() => onCommit(draft)}
      onKeyDown={(ev) => ev.key === "Enter" && (ev.target as HTMLInputElement).blur()} />
  );
}

/* §4.4 c — report: text or one file, not both */
function Report({ a, e }: { a: Amt; e: AmtEvent }) {
  const hasText = !!e.report.trim();
  const [mode, setMode] = useState<"text" | "file">(e.reportFile ? "file" : "text");
  const [prevText, setPrevText] = useState<string | null>(null);
  const missing = isDone(e) && e.kind === "redac" && !hasReport(e);
  const bd = missing ? "border-grimm-100" : "border-stark-40";
  const id = `rep-${e.id}`;

  const addFile = (f: File | undefined) => {
    if (!f) return;
    const rf = { name: f.name, by: ME, d: TODAY, size: fsize(f.size) };
    a.updE(e.id, { reportFile: rf });
    a.log(`Compte rendu joint à « ${e.title} »`, null, rf.name);
    a.flash("Compte rendu joint", () => a.updE(e.id, { reportFile: null }));
  };
  const removeFile = () => {
    const old = e.reportFile;
    a.updE(e.id, { reportFile: null });
    a.log(`Compte rendu retiré de « ${e.title} »`, old?.name ?? null, null);
    a.flash("Compte rendu retiré", () => a.updE(e.id, { reportFile: old }));
  };

  return (
    <div className="flex min-w-0 max-w-[640px] flex-col gap-1.5">
      <label htmlFor={id} className="inline-flex items-center gap-1.5 font-semibold">
        Compte rendu {e.kind !== "redac" && <span className="text-xs font-normal text-stark-120">· facultatif</span>}
        {missing && <span role="img" aria-label="À compléter" title="Compte rendu à écrire"><WarnIcon size={15} /></span>}
      </label>
      <div role="group" aria-label="Forme du compte rendu" className="inline-flex gap-0.5 self-start rounded-md border border-stark-40 p-0.5">
        <button type="button" className="seg" aria-pressed={mode === "text"} disabled={!!e.reportFile} onClick={() => setMode("text")}
          title={e.reportFile ? "Retirez le fichier pour rédiger le compte rendu à la place" : "Rédiger le compte rendu"}>Rédiger</button>
        <button type="button" className="seg" aria-pressed={mode === "file"} disabled={hasText} onClick={() => setMode("file")}
          title={hasText ? "Videz le texte pour joindre un fichier à la place" : "Joindre le compte rendu en fichier"}>Joindre un fichier</button>
      </div>
      {mode === "text" ? (
        <textarea id={id} value={e.report} placeholder="Participants, constats, préconisations, suites à donner…"
          className={`field block min-h-[150px] w-full resize-y px-3 py-2.5 leading-[1.55] placeholder:text-[#7d87a8] ${bd}`}
          onChange={(ev) => a.updE(e.id, { report: ev.target.value })}
          onFocus={() => setPrevText(e.report)}
          onBlur={() => {
            if (prevText !== null && prevText !== e.report) a.log(`${prevText.trim() ? "Compte rendu modifié" : "Compte rendu ajouté"} sur « ${e.title} »`);
            setPrevText(null);
          }} />
      ) : e.reportFile ? (
        <div className="flex items-center gap-2.5 rounded-md border border-stark-20 bg-white py-1.5 pr-1.5 pl-2.5">
          <FileText size={18} className="flex-none text-stark-120" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold" title={e.reportFile.name}>{e.reportFile.name}</div>
            <div className="text-xs text-stark-120">{e.reportFile.by} · {fmt(e.reportFile.d)} · {e.reportFile.size}</div>
          </div>
          <button type="button" className="icon-btn" aria-label={`Consulter ${e.reportFile.name}`} onClick={() => a.flash("Aperçu non reproduit dans ce prototype")}><Eye size={15} /></button>
          <button type="button" className="icon-btn text-stark-100" aria-label={`Retirer ${e.reportFile.name}`} onClick={removeFile}><X size={12} strokeWidth={2.5} /></button>
        </div>
      ) : (
        <label className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed bg-[#fbfcfe] p-3 text-center font-semibold text-raven-100 ${bd}`}>
          <Upload size={20} />Joindre le compte rendu<span className="text-xs font-normal text-stark-120">Un seul fichier</span>
          <input id={id} type="file" aria-label="Joindre le compte rendu (un seul fichier)" className="absolute inset-0 w-full cursor-pointer opacity-0"
            onChange={(ev) => { addFile(ev.target.files?.[0]); ev.target.value = ""; }} />
        </label>
      )}
      {(hasText || e.reportFile) && (
        <span className="text-xs text-stark-120">
          {e.reportFile ? "Un fichier est joint : retirez-le pour rédiger à la place." : "Un texte est rédigé : videz-le pour joindre un fichier à la place."}
        </span>
      )}
    </div>
  );
}
