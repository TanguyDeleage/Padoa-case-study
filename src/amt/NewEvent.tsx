/* "Ajouter un évènement" flow, reproduced from the original AMT dialog artifact:
   a small type menu, then a 460px form (intervention, or other type of event). */
import { ChevronDown, CircleAlert, Plus, Sparkles, Star, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { AmtStatus } from "../data/amts";
import { AMT_STATUSES, PEOPLE, ROLES, STATUS_DOT, TODAY, fmt, hm, mins, type AmtEvent } from "./model";
import { perimLine } from "./perimeter";
import { Modal } from "./ui";
import { ME, type Amt } from "./useAmt";

export type NewEventKind = "inter" | "autre";

/* ---------- type menu ---------- */

const MENU = ["Intervention", "Autre type d’évènement", "Évènement collectif", "AFP"] as const;

export function AddEventMenu({ anchor, onPick, onClose }: { anchor: HTMLElement; onPick: (k: (typeof MENU)[number]) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const el = ref.current!;
    const w = el.offsetWidth;
    let top = r.bottom + 4;
    if (top + el.offsetHeight > innerHeight - 16) top = r.top - 4 - el.offsetHeight;
    setPos({ left: Math.max(16, Math.min(r.right - w, innerWidth - w - 16)), top });
    el.querySelector("button")?.focus();
  }, [anchor]);
  return (
    <>
      <button type="button" tabIndex={-1} aria-label="Fermer le menu" onClick={onClose} className="fixed inset-0 z-30 cursor-default bg-transparent" />
      <div ref={ref} role="menu" onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="fixed z-30 max-w-[460px] min-w-[240px] rounded-md bg-white p-1 shadow-md" style={pos}>
        {MENU.map((k) => (
          <button key={k} type="button" role="menuitem" onClick={() => onPick(k)} className="flex w-full rounded px-2.5 py-2 text-left text-stark-180 hover:bg-raven-05">{k}</button>
        ))}
      </div>
    </>
  );
}

/* ---------- form ---------- */

const DEPARTS = ["Domicile - 4 rue Mirebeau, 18000 Bourges", "Centre de Bourges - 8 bd Gambetta, 18000 Bourges", "Antenne de Vierzon - 2 av. de la République, 18100 Vierzon"];
const DEPART_MIN = [20, 15, 35];
const CONTACTS = ["GIRARD Paul, gérant", "MARTIN Léa, responsable RH", "ROCHE Bruno, référent sécurité"];
const ADDRESSES: Record<string, string> = {
  "Atelier Lumière SARL": "12 rue des Verriers, 18000 Bourges",
  "Menuiserie Lefort": "7 rue de la Gare, 18100 Vierzon",
  "Imprimerie Nouvelle": "21 avenue Jean Jaurès, 18000 Bourges",
  "Ferronnerie Duval": "4 route de Montluçon, 18200 Saint-Amand-Montrond",
  "Garage Central Mehun": "2 place du 14 Juillet, 18500 Mehun-sur-Yèvre",
};

type Dir = "aller" | "retour";
interface Trajet { mode: string; h: string; pt: string; min: string }

/** Seed events only know their planned travel in hours: show it as an outbound + return split */
function trajetsOf(e: AmtEvent): Partial<Record<Dir, Trajet>> {
  if (e.trajets) return e.trajets;
  const m = Math.round((e.plan.trajet || 0) * 60);
  if (!m) return {};
  const half = String(Math.round(m / 2));
  return { aller: { mode: "Arrivée à", h: "", pt: "", min: half }, retour: { mode: "Départ à", h: "", pt: "", min: String(m - Number(half)) } };
}

/** Creates an event, or edits one: same dialog, pre-filled, every field can be overridden */
export function NewEventDialog({ a, kind, editing, onClose }: { a: Amt; kind?: NewEventKind; editing?: AmtEvent; onClose: () => void }) {
  const e0 = editing;
  const inter = e0 ? e0.kind === "inter" : kind === "inter";
  const [st, setSt] = useState<AmtStatus>(a.statut);
  const [type, setType] = useState(e0 && !inter ? (e0.typeLabel ?? "Rédaction") : "");
  const [title, setTitle] = useState(e0?.title ?? a.amt.title);
  const [desc, setDesc] = useState<string | null>(e0?.description ?? null);
  const [date, setDate] = useState(e0?.date ?? TODAY);
  const [start, setStart] = useState(e0?.start ?? "");
  const [end, setEnd] = useState(e0?.end ?? "");
  // Editing a rendez-vous: every participant who has an occurrence of it
  const [pds, setPds] = useState<string[]>(() => (e0 ? a.events.filter((x) => x.rdv === e0.rdv).map((x) => x.who) : [ME]));
  const [addr, setAddr] = useState(e0?.address ?? ADDRESSES[a.amt.company] ?? `${a.amt.company}, 18000 Bourges`);
  const [visio, setVisio] = useState(e0?.typeLabel === "Intervention en visio");
  const [contact, setContact] = useState(e0?.contact ?? "");
  const [trajets, setTrajets] = useState<Partial<Record<Dir, Trajet>>>(e0 ? trajetsOf(e0) : {});
  const [shared, setShared] = useState(e0?.shared ?? false);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [slotInfo, setSlotInfo] = useState(false);

  const perimText = perimLine(a.amt, a.perim);

  const save = () => {
    const e: Record<string, boolean> = {};
    const s = mins(start);
    const en = mins(end);
    if (!inter && !type) e.type = true;
    else if (!title.trim()) e.title = true;
    else if (!date) e.date = true;
    else if (!start) e.start = true;
    else if (!end || s === null || en === null || en <= s) e.end = true;
    else if (!pds.length) e.pds = true;
    else if (inter && !visio && !addr.trim()) e.addr = true;
    else if (inter) (["aller", "retour"] as Dir[]).forEach((d) => { const t = trajets[d]; if (t && !(parseFloat(t.min) > 0)) e[`tj-${d}`] = true; });
    setErrs(e);
    if (Object.keys(e).length) return;

    const slot = (en! - s!) / 60;
    const trajetH = inter ? (["aller", "retour"] as Dir[]).reduce((acc, d) => acc + (parseFloat(trajets[d]?.min ?? "") || 0), 0) / 60 : 0;
    const t = title.trim();
    const typeLabel = inter ? (visio ? "Intervention en visio" : undefined) : type === "Rédaction" ? undefined : type;
    const fields = {
      title: t, date, start, end, typeLabel,
      description: desc?.trim() || undefined, address: inter && !visio ? addr.trim() : undefined,
      contact: contact || undefined, shared: inter ? shared : undefined,
      trajets: inter && !visio ? trajets : undefined,
    };
    // One occurrence per participant, linked by the rendez-vous id (§0)
    const rdv = e0?.rdv ?? `r${Date.now()}`;
    // RG-E5: recompute the main category from the time slot, keep the planned redaction of an intervention
    const plan = { inter: inter ? slot : 0, redac: inter ? (e0?.plan.redac ?? 0) : slot, trajet: trajetH };
    const fresh = (who: string, i: number): AmtEvent => ({
      id: `n${Date.now()}${i}`, rdv, kind: inter ? "inter" : "redac", who, plan: { ...plan },
      real: {}, report: "", reportFile: null, ...fields,
    });
    const when = `${t} (${fmt(date)}, ${hm(start)} – ${hm(end)})`;
    if (st !== a.statut) a.setStatut(st);
    if (e0) {
      // RG-E5: shared fields apply to every occurrence, each keeps its own real times and report;
      // an added participant gets a new occurrence, a removed one loses theirs
      const had = a.events.filter((x) => x.rdv === rdv).map((x) => x.who);
      const added = pds.filter((p) => !had.includes(p));
      const removed = had.filter((p) => !pds.includes(p));
      const n = (k: number, verb: string) => `${k} participant${k > 1 ? "s" : ""} ${verb}${k > 1 ? "s" : ""}`;
      a.changeEvents((l) => [
        ...l.filter((x) => x.rdv !== rdv || pds.includes(x.who)).map((x) => (x.rdv === rdv ? { ...x, ...fields, plan: { ...plan } } : x)),
        ...added.map(fresh),
      ],
        [`« ${t} » modifié`, added.length && n(added.length, "ajouté"), removed.length && n(removed.length, "retiré")].filter(Boolean).join(" · "),
        ["Évènement modifié", `${e0.title} (${fmt(e0.date)}, ${hm(e0.start)} – ${hm(e0.end)}) · ${had.join(", ")}`, `${when} · ${pds.join(", ")}`]);
    } else {
      a.changeEvents((l) => [...l, ...pds.map(fresh)], inter ? "Intervention ajoutée" : "Évènement ajouté",
        ["Évènement ajouté", null, `${when} · ${pds.join(", ")}`]);
    }
    onClose();
  };

  const addTrajet = (d: Dir) => setTrajets((x) => ({ ...x, [d]: { mode: d === "aller" ? "Arrivée à" : "Départ à", h: "", pt: "", min: "" } }));
  const setTj = (d: Dir, patch: Partial<Trajet>) => setTrajets((x) => ({ ...x, [d]: { ...x[d]!, ...patch } }));

  return (
    <Modal title={e0 ? (inter ? "Modifier l’intervention" : "Modifier l’évènement") : inter ? "Ajouter une intervention" : "Ajouter un évènement"} width={460} onClose={onClose}
      footer={<><button type="button" className="btn" onClick={onClose}>Annuler</button><button type="button" className="btnp" onClick={save}>{e0 ? "Enregistrer" : "Ajouter"}</button></>}>
      <div className="flex flex-col gap-2 rounded-md border border-stark-20 px-3 py-2.5">
        <div className="min-w-0">
          <b className="font-semibold">{a.amt.title}</b> <span className="text-stark-120">#{a.amt.id}</span>
          <div className="truncate text-stark-120">{perimText}</div>
        </div>
        <hr className="m-0 border-0 border-t border-stark-20" />
        <div className="relative flex h-7 w-max items-center gap-2 rounded-md border border-stark-40 bg-white px-2.5 hover:border-stark-100 focus-within:border-raven-100 focus-within:shadow-halo">
          <span className="h-2 w-2 flex-none rounded-full" style={{ background: STATUS_DOT[st] }} />
          <select aria-label="Statut de l’AMT" value={st} onChange={(e) => setSt(e.target.value as AmtStatus)} className="h-full cursor-pointer appearance-none border-0 bg-transparent pr-5 outline-none">
            {AMT_STATUSES.map((x) => <option key={x}>{x}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 text-stark-120" />
        </div>
      </div>

      {!inter && (
        <Field id="iv-type" label="Type d’évènement *" err={errs.type} msg="Sélectionnez une option">
          <select id="iv-type" className={inp(errs.type)} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Sélectionner</option><option>Rédaction</option><option>Autre type d’évènement</option>
          </select>
        </Field>
      )}
      <Field id="iv-title" label="Titre de l’évènement *" err={errs.title}>
        <input id="iv-title" className={inp(errs.title)} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      {desc === null ? (
        <div><button type="button" className="link" onClick={() => setDesc("")}><Plus size={14} />Ajouter une description</button></div>
      ) : (
        <Field id="iv-desc" label="Description - Facultatif">
          <textarea id="iv-desc" autoFocus className="field h-[124px] max-w-[700px] resize-none py-2" placeholder="Saisir une description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
      )}
      <hr className="my-0.5 border-0 border-t border-stark-20" />
      <div className="flex flex-wrap gap-3 [&>*]:flex-[1_1_120px]">
        <Field id="iv-date" label="Date *" err={errs.date}><input id="iv-date" type="date" className={inp(errs.date)} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field id="iv-start" label="Début *" err={errs.start}><input id="iv-start" type="time" className={inp(errs.start)} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field id="iv-end" label="Fin *" err={errs.end} msg="L’horaire de fin doit être ultérieur à l’horaire de début"><input id="iv-end" type="time" className={inp(errs.end)} value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      </div>
      <Field label="Intervenants *" err={errs.pds} msg="Sélectionnez au moins une option">
        <PeoplePicker sel={pds} onChange={setPds} err={errs.pds} />
      </Field>
      <div>
        <button type="button" className="btn" onClick={() => setSlotInfo(true)}>Trouver un créneau disponible</button>
        {slotInfo && <p className="mt-1.5 mb-0 text-xs text-stark-120">La recherche de créneau ouvre un planning dédié dans padoa. Elle n’est pas reproduite dans ce prototype.</p>}
      </div>

      {inter && (
        <>
          <div className="-mb-1 mt-1 text-sm font-semibold">Précisions pour l’intervention</div>
          <Field id="iv-addr" label="Adresse de l’intervention *" err={errs.addr}>
            <input id="iv-addr" className={`${inp(errs.addr)} disabled:bg-wayne-05 disabled:text-stark-100`} disabled={visio} value={addr} onChange={(e) => setAddr(e.target.value)} />
          </Field>
          <label className="inline-flex cursor-pointer items-start gap-2">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-raven-100" checked={visio} onChange={(e) => { setVisio(e.target.checked); if (e.target.checked) setTrajets({}); }} />En visio
          </label>
          <Field id="iv-ct" label="Contacts sur place - Facultatif">
            <select id="iv-ct" className={inp()} value={contact} onChange={(e) => setContact(e.target.value)}>
              <option value="">Sélectionner un contact dans l’entreprise</option>
              {CONTACTS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          {(["aller", "retour"] as Dir[]).filter((d) => trajets[d]).map((d) => (
            <TrajetBlock key={d} dir={d} t={trajets[d]!} addr={addr} err={errs[`tj-${d}`]} set={(p) => setTj(d, p)}
              remove={() => setTrajets((x) => { const y = { ...x }; delete y[d]; return y; })} />
          ))}
          {!visio && (
            <div className="flex flex-col items-start gap-1.5">
              {!trajets.aller && <button type="button" className="link" onClick={() => addTrajet("aller")}><Plus size={14} />Ajouter un trajet aller</button>}
              {!trajets.retour && <button type="button" className="link" onClick={() => addTrajet("retour")}><Plus size={14} />Ajouter un trajet retour</button>}
            </div>
          )}
          <div className="-mb-1 mt-1 text-sm font-semibold">Partage avec l’adhérent</div>
          <div className="flex flex-col gap-1.5">
            <label className="inline-flex cursor-pointer items-start gap-2"><input type="radio" name="iv-share" className="mt-0.5 accent-raven-100" checked={!shared} onChange={() => setShared(false)} />Non partagé</label>
            <label className="inline-flex cursor-pointer items-start gap-2"><input type="radio" name="iv-share" className="mt-0.5 accent-raven-100" checked={shared} onChange={() => setShared(true)} />Partagé avec l’adhérent</label>
          </div>
        </>
      )}
    </Modal>
  );
}

const inp = (err?: boolean, w = "w-full") => `field h-8 ${w} max-w-[400px] ${err ? "border-allen-100" : ""}`;

function Field({ id, label, err, msg = "Ce champ est obligatoire", children }: { id?: string; label: string; err?: boolean; msg?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {id ? <label htmlFor={id} className="font-semibold text-stark-120">{label}</label> : <span className="font-semibold text-stark-120">{label}</span>}
      {children}
      {err && <span className="flex items-center gap-1 text-[11px] text-allen-120"><CircleAlert size={14} />{msg}</span>}
    </div>
  );
}

function TrajetBlock({ dir, t, addr, err, set, remove }: { dir: Dir; t: Trajet; addr: string; err?: boolean; set: (p: Partial<Trajet>) => void; remove: () => void }) {
  const aller = dir === "aller";
  const i = DEPARTS.indexOf(t.pt);
  const dot = (full = false) => <span className={`h-2 w-2 justify-self-center rounded-full border-2 border-stark-40 ${full ? "bg-stark-40" : ""}`} />;
  const point = (
    <select aria-label={aller ? "Départ du trajet aller" : "Arrivée du trajet retour"} className={inp()} value={t.pt} onChange={(e) => set({ pt: e.target.value })}>
      <option value="">{aller ? "Sélectionner le départ ou chercher une adresse" : "Sélectionner l’arrivée ou chercher une adresse"}</option>
      {DEPARTS.map((d) => <option key={d}>{d}</option>)}
    </select>
  );
  const place = <span className="truncate">{addr}</span>;
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Trajet {dir} <span className="font-normal text-stark-120">- Facultatif</span></span>
        <button type="button" className="link" onClick={remove}>Supprimer</button>
      </div>
      <div className="flex gap-3">
        <select aria-label={`Type d’horaire du trajet ${dir}`} className={`${inp(false, "w-[130px]")} flex-none`} value={t.mode} onChange={(e) => set({ mode: e.target.value })}>
          <option>Départ à</option><option>Arrivée à</option>
        </select>
        <input type="time" aria-label={`Horaire du trajet ${dir}`} className={`${inp(false, "w-[110px]")} flex-none`} value={t.h} onChange={(e) => set({ h: e.target.value })} />
      </div>
      <div className="grid grid-cols-[16px_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5">
        {aller ? <>{dot()}{point}</> : <>{dot(true)}{place}</>}
        <span className="h-3.5 w-0.5 justify-self-center border-l-2 border-dotted border-stark-40" /><span />
        {aller ? <>{dot(true)}{place}</> : <>{dot()}{point}</>}
      </div>
      <div className="flex gap-2 rounded-md bg-bishop-05 px-3 py-2.5">
        <Sparkles size={16} className="mt-0.5 flex-none text-bishop-100" />
        {i < 0 ? (
          <div><b className="font-semibold">Durée recommandée</b><div>Sélectionnez une adresse {aller ? "de départ" : "d’arrivée"} géolocalisée pour afficher les suggestions</div></div>
        ) : (
          <>
            <div className="flex-1"><b className="font-semibold">Durée recommandée</b><div>Environ {DEPART_MIN[i]} minutes en voiture</div></div>
            <button type="button" className="link" onClick={() => set({ min: String(DEPART_MIN[i]) })}>Appliquer</button>
          </>
        )}
      </div>
      <Field id={`tj-${dir}-min`} label="Durée du trajet en minutes *" err={err}>
        <input id={`tj-${dir}-min`} type="number" min={1} step={5} placeholder="Minutes" className={inp(err, "w-[120px]")} value={t.min} onChange={(e) => set({ min: e.target.value })} />
      </Field>
    </div>
  );
}

/* ---------- intervenants picker (favoris, récents, recherche) ---------- */

const FAV = new Set<string>();
let REC: string[] = [];

function PeoplePicker({ sel, onChange, err }: { sel: string[]; onChange: (v: string[]) => void; err?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [, bump] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const fld = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 320 });
  const pop = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !fld.current || !pop.current) return;
    const r = fld.current.getBoundingClientRect();
    const width = Math.min(Math.max(r.width, 320), 460, innerWidth - 32);
    let top = r.bottom + 4;
    if (top + pop.current.offsetHeight > innerHeight - 8) top = Math.max(8, r.top - 4 - pop.current.offsetHeight);
    setPos({ left: Math.max(16, Math.min(r.left, innerWidth - width - 16)), top, width });
  }, [open, q, sel]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!host.current?.contains(e.target as Node)) setOpen(false); };
    const scroll = (e: Event) => { if (!pop.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    document.addEventListener("scroll", scroll, true);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("scroll", scroll, true); };
  }, [open]);

  const toggle = (id: string, on: boolean) => {
    onChange(on ? [...sel, id] : sel.filter((x) => x !== id));
    if (on) REC = [id, ...REC.filter((x) => x !== id)].slice(0, 10);
  };
  const row = (id: string) => (
    <label key={id} className="group flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-raven-05">
      <input type="checkbox" className="m-0 h-4 w-4 flex-none accent-raven-100" checked={sel.includes(id)} onChange={(e) => toggle(id, e.target.checked)} />
      <span className="min-w-0 flex-1">{id}<small className="block text-[11px] text-stark-120">{ROLES[id]}</small></span>
      <button type="button" aria-label={FAV.has(id) ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={(e) => { e.preventDefault(); if (FAV.has(id)) FAV.delete(id); else FAV.add(id); bump((n) => n + 1); }}
        className={`inline-flex h-6 w-6 items-center justify-center rounded ${FAV.has(id) ? "visible text-grimm-100" : "invisible text-stark-100 group-hover:visible"}`}>
        <Star size={15} className={FAV.has(id) ? "fill-current" : ""} />
      </button>
    </label>
  );
  const sect = (l: string) => <div className="flex items-center gap-2 px-1.5 pt-2 pb-1 text-[11px] font-semibold tracking-[.06em] text-stark-120 uppercase after:flex-1 after:border-t after:border-stark-20 after:content-['']">{l}</div>;
  const hint = (t: string) => <div className="px-1.5 pt-0.5 pb-1.5 text-stark-100">{t}</div>;

  let list: ReactNode;
  if (q) {
    const r = PEOPLE.filter((p) => `${p} ${ROLES[p]}`.toLowerCase().includes(q.toLowerCase()));
    list = <>{sect(`Résultats (${r.length})`)}{r.length ? r.map(row) : hint("Aucun résultat pour cette recherche")}</>;
  } else {
    const f = PEOPLE.filter((p) => FAV.has(p));
    list = <>
      {sect(`Favoris (${f.length})`)}{f.length ? f.map(row) : hint("Pour ajouter des favoris, cliquez sur l’étoile au bout de chaque ligne")}
      {sect(`Récents (${REC.length})`)}{REC.length ? REC.map(row) : hint("Les éléments sélectionnés récemment s’afficheront ici")}
      {sect("Suggestions")}{PEOPLE.map(row)}
    </>;
  }

  return (
    <div ref={host} className="relative max-w-[400px]">
      <button ref={fld} type="button" aria-haspopup="listbox" onClick={() => { setOpen(!open); setQ(""); }}
        className={`flex h-8 w-full items-center gap-2 rounded-md border bg-white px-2.5 text-left hover:border-stark-100 ${open ? "border-raven-100 shadow-halo" : err ? "border-allen-100" : "border-stark-40"}`}>
        <span className="min-w-0 flex-1 truncate">{sel.length ? sel.join(", ") : <span className="text-stark-100">Sélectionner des intervenants</span>}</span>
        {sel.length > 0 && <span className="rounded bg-raven-05 px-1.5 text-[11px] font-semibold text-raven-120">{sel.length}</span>}
        <ChevronDown size={14} className="text-stark-120" />
      </button>
      {open && (
        <div ref={pop} className="fixed z-50 flex flex-col gap-1.5 rounded-md bg-white p-2 shadow-md" style={pos}>
          <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-md border border-raven-100 px-1.5 py-[3px]">
            {sel.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 rounded-xl border border-stark-40 py-px pr-1 pl-2 text-xs">
                {p}
                <button type="button" aria-label={`Retirer ${p}`} onClick={() => toggle(p, false)} className="inline-flex h-5 w-5 items-center justify-center rounded-full text-stark-120 hover:bg-stark-05"><X size={12} /></button>
              </span>
            ))}
            <input autoFocus aria-label="Rechercher un intervenant" placeholder="Rechercher un intervenant" value={q} onChange={(e) => setQ(e.target.value)}
              className="h-6 min-w-[120px] flex-1 border-0 bg-transparent outline-none" />
          </div>
          <div role="listbox" aria-multiselectable="true" className="flex max-h-[300px] flex-col overflow-auto">{list}</div>
        </div>
      )}
    </div>
  );
}
