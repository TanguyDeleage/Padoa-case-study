import { ArrowRight, Building2, Pencil, User } from "lucide-react";
import { useState } from "react";
import { ETIQUETTES, etiqColor, fmt } from "./model";
import { PerimeterDialog } from "./PerimeterDialog";
import { perimItems, perimLabel } from "./perimeter";
import { Avatar, Modal } from "./ui";
import { type Amt, type Info } from "./useAmt";

export function SidePanel({ a }: { a: Amt }) {
  const [tab, setTab] = useState<"fiche" | "act">("fiche");
  const tabCls = (on: boolean) => `-mb-px border-0 border-b-2 bg-transparent px-0 pt-3.5 pb-2.5 font-semibold ${on ? "border-raven-100 text-raven-100" : "border-transparent text-stark-120"}`;
  return (
    <aside aria-label="Informations de l’AMT" className="flex w-[360px] flex-none flex-col overflow-hidden border-l border-[#dfe6f5] bg-[#eef4ff]">
      <div role="tablist" className="flex flex-none gap-6 border-b border-stark-20 bg-[#eef4ff] px-6">
        <button type="button" role="tab" aria-selected={tab === "fiche"} className={tabCls(tab === "fiche")} onClick={() => setTab("fiche")}>Fiche</button>
        <button type="button" role="tab" aria-selected={tab === "act"} className={tabCls(tab === "act")} onClick={() => setTab("act")}>
          Activité <span className="rounded bg-raven-05 px-1.5 text-[11px] text-raven-120">{a.hist.length}</span>
        </button>
      </div>
      {tab === "fiche" ? <Fiche a={a} /> : <Activity a={a} />}
    </aside>
  );
}

function Fiche({ a }: { a: Amt }) {
  const [perimOpen, setPerimOpen] = useState(false);
  const [etiqOpen, setEtiqOpen] = useState(false);
  const I = a.info;
  const items = perimItems(a.amt, a.perim);
  const isAdh = a.perim.kind === "adh";
  const more = items.length - 3;

  const text = (k: keyof Info, label: string) => ({
    value: I[k] as string,
    onChange: (e: { target: { value: string } }) => a.setInfo(k, e.target.value as never),
    onFocus: () => a.focusField(k),
    onBlur: () => a.blurField(k, label),
  });
  const select = (k: keyof Info, label: string) => ({
    value: I[k] as string,
    onChange: (e: { target: { value: string } }) => a.setInfoNow(k, e.target.value as never, label),
  });
  const sw = (k: "maintien" | "rapport" | "eva", l: string) => (
    <button key={k} type="button" role="switch" aria-checked={I[k]} onClick={() => a.setInfoNow(k, !I[k], l, [l, I[k] ? "Oui" : "Non", I[k] ? "Non" : "Oui"])}
      className="-mx-2 flex items-center justify-between gap-3 rounded-md border-0 bg-transparent px-2 py-1.5 text-left hover:bg-[rgba(0,18,53,.06)]">
      <span>{l}</span>
      <span aria-hidden="true" className="relative inline-block h-[18px] w-8 flex-none rounded-full" style={{ background: I[k] ? "#0046da" : "#c9cfe0" }}>
        <span className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-[left]" style={{ left: I[k] ? 16 : 2 }} />
      </span>
    </button>
  );
  const chip = "inline-flex h-7 items-center gap-1 rounded-md border border-stark-40 bg-white px-2.5 text-xs font-semibold text-raven-100 hover:bg-raven-05";
  const lbl = "pt-1 text-stark-120";

  return (
    <>
      {/* Only the fields scroll; the switches stay pinned at the bottom */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pt-4 pb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="side-h">Périmètre · {perimLabel(a.perim)}</h3>
            <button type="button" className={chip} onClick={() => setPerimOpen(true)}><Pencil size={13} />Modifier</button>
          </div>
          {items.slice(0, 3).map(({ id, name, sub }) => (
            <div key={id} className="flex items-center gap-2.5 rounded-md border border-stark-20 px-2.5 py-1.5">
              {isAdh ? <Building2 size={18} className="flex-none text-stark-120" /> : <User size={18} className="flex-none text-stark-120" />}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{name}</div>
                <div className="truncate text-xs text-stark-120">{sub}</div>
              </div>
            </div>
          ))}
          {more > 0 && (
            <button type="button" className="self-start border-0 bg-transparent p-0 font-semibold text-raven-100" onClick={() => setPerimOpen(true)}>
              Voir les {more} autre{more > 1 ? "s" : ""} {isAdh ? "entreprise" : "salarié"}{more > 1 ? "s" : ""}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="side-h">Demande</h3>
          <div className="grid grid-cols-[100px_minmax(0,1fr)] items-start gap-x-3 gap-y-2.5">
            <label htmlFor="b-type" className={lbl}>Type</label>
            <div className="pl-2"><select id="b-type" className="ghost cursor-pointer" {...select("type", "Type")}>{["RPS", "Ergonomie", "Bruit", "Risque chimique"].map((o) => <option key={o}>{o}</option>)}</select></div>
            <label htmlFor="b-dem" className={lbl}>Demandeur</label>
            <div className="pl-2"><select id="b-dem" className="ghost cursor-pointer" {...select("demandeur", "Demandeur")}>{["PETIT Julie", "Dr MOREAU Claire", "FERRAND Hugo", "CARON Inès"].map((o) => <option key={o}>{o}</option>)}</select></div>
            <label htmlFor="b-ct" className={lbl}>Contact</label>
            <div className="pl-2"><input id="b-ct" className="ghost" placeholder="+ Ajouter un contact" {...text("contact", "Contact")} /></div>
            <label htmlFor="b-ctx" className={lbl}>Contexte</label>
            <div className="pl-2"><textarea id="b-ctx" className="ghost block min-h-[110px] resize-y" placeholder="+ Ajouter un contexte" {...text("contexte", "Contexte")} /></div>
            <label htmlFor="b-desc" className={lbl}>Description</label>
            <div className="pl-2"><textarea id="b-desc" className="ghost block min-h-[110px] resize-y" placeholder="+ Ajouter une description" {...text("description", "Description")} /></div>
          </div>
        </div>

        {/* Kept discreet: the first two, truncated, and the rest behind the dialog */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="side-h">Étiquettes · {I.etiquettes.length}</h3>
            <button type="button" className={chip} onClick={() => setEtiqOpen(true)}><Pencil size={13} />{I.etiquettes.length ? "Modifier" : "Ajouter"}</button>
          </div>
          {I.etiquettes.slice(0, 2).map((t) => (
            <div key={t} title={t} className="flex min-w-0 items-center gap-1.5 text-stark-120">
              <i aria-hidden="true" className="h-2.5 w-3.5 flex-none [clip-path:polygon(0_0,75%_0,100%_50%,75%_100%,0_100%)]" style={{ background: etiqColor(t) }} />
              <span className="truncate">{t}</span>
            </div>
          ))}
          {I.etiquettes.length > 2 && (
            <button type="button" className="self-start border-0 bg-transparent p-0 font-semibold text-raven-100" onClick={() => setEtiqOpen(true)}>
              Voir {I.etiquettes.length - 2 > 1 ? `les ${I.etiquettes.length - 2} autres` : "l’autre"}
            </button>
          )}
          {!I.etiquettes.length && <span className="text-stark-100">Aucune étiquette</span>}
        </div>
      </div>

      <div className="flex flex-none flex-col gap-1 border-t border-stark-20 px-6 py-3">
        {sw("maintien", "Relève du maintien en emploi")}
        {sw("rapport", "Rapport envoyé à l’adhérent")}
        {sw("eva", "Intérêt pour eva")}
      </div>

      {perimOpen && <PerimeterDialog a={a} onClose={() => setPerimOpen(false)} />}
      {etiqOpen && <EtiquettesDialog a={a} onClose={() => setEtiqOpen(false)} />}
    </>
  );
}

function EtiquettesDialog({ a, onClose }: { a: Amt; onClose: () => void }) {
  const cur = a.info.etiquettes;
  const [sel, setSel] = useState(cur);
  const opts = [...ETIQUETTES, ...cur.filter((t) => !ETIQUETTES.includes(t))];
  const save = () => {
    const next = opts.filter((t) => sel.includes(t));
    if (next.join() !== cur.join()) a.setInfoNow("etiquettes", next, "Étiquettes");
    onClose();
  };
  return (
    <Modal title="Modifier les étiquettes" width={640} onClose={onClose}
      footer={<><button type="button" className="btn" onClick={onClose}>Annuler</button><button type="button" className="btnp" onClick={save}>Enregistrer</button></>}>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-1 p-0 font-semibold text-stark-120">Étiquettes - Facultatif</legend>
        {opts.map((t) => (
          <label key={t} className="flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" checked={sel.includes(t)} className="mt-0.5 h-4 w-4 flex-none accent-raven-100"
              onChange={(e) => setSel(e.target.checked ? [...sel, t] : sel.filter((y) => y !== t))} />
            <span className="font-semibold">{t}</span>
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}

function Activity({ a }: { a: Amt }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-6 pt-4 pb-8">
      {a.hist.map((h, i) => (
        <div key={i} className="flex gap-2.5">
          <Avatar name={h.by} />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-stark-120"><b className="font-semibold text-stark-180">{h.by}</b> · {fmt(h.d)}{h.time ? ` à ${h.time}` : ""}</div>
            <div>{h.text}</div>
            {(h.from != null || h.to != null) && (
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                {h.from != null && <span title="Ancienne valeur" className="max-w-full truncate rounded bg-stark-05 px-1.5 text-stark-100 line-through">{h.from}</span>}
                {h.from != null && h.to != null && <ArrowRight size={14} className="flex-none text-stark-100" aria-label="devient" />}
                {h.to != null && <span title="Nouvelle valeur" className="max-w-full truncate rounded bg-raven-05 px-1.5 font-semibold text-raven-120">{h.to}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
