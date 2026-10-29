import { CircleAlert, Download, Eye, FileText, Paperclip, Plus, SquarePen, Users, X } from "lucide-react";
import { useState } from "react";
import { PEOPLE, ROLES, TODAY, fmt, fsize, type AmtEvent, type FileRef } from "./model";
import { Avatar, Modal, Tooltip } from "./ui";
import { ME, type Amt } from "./useAmt";

const chip = "relative inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-stark-40 bg-white px-2.5 text-xs font-semibold text-raven-100 hover:bg-raven-05";

/** Below the events table: conclusion, then intervenants (left) and documents (right) */
export function Closing({ a }: { a: Amt }) {
  const I = a.info;
  const [editPeople, setEditPeople] = useState(false);
  const busy = new Set(a.events.map((e) => e.who));
  /* RG-C3: the AMT's own documents (i = index in a.docs) and the files attached as reports to its events, newest first */
  const docs: (FileRef & { i?: number; ev?: AmtEvent })[] = [
    ...a.docs.map((d, i) => ({ ...d, i })),
    ...a.events.flatMap((e) => (e.reportFile ? [{ ...e.reportFile, ev: e }] : [])),
  ].sort((x, y) => y.d.localeCompare(x.d));
  return (
    <div className="mt-6 flex flex-none flex-col gap-5">
      <section aria-labelledby="h-concl" className="flex flex-col gap-3">
        <h3 id="h-concl" className="card-title"><SquarePen size={18} className="text-stark-120" />Conclusion</h3>
        <textarea aria-labelledby="h-concl" className="field block min-h-24 w-full resize-y px-3 py-2.5 leading-[1.55] placeholder:text-[#7d87a8]"
          placeholder="Rédigez la conclusion de l’action…" value={I.conclusion}
          onChange={(e) => a.setInfo("conclusion", e.target.value)} onFocus={() => a.focusField("conclusion")} onBlur={() => a.blurField("conclusion", "Conclusion")} />
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-start gap-5">
        <section aria-labelledby="h-team" className="card">
          <div className="flex items-center justify-between gap-2">
            <h3 id="h-team" className="card-title"><Users size={18} className="text-stark-120" />Intervenants
              <span className="rounded bg-stark-05 px-1.5 text-[11px] font-semibold text-stark-120">{I.intervenants.length}</span>
            </h3>
            <button type="button" className={chip} onClick={() => setEditPeople(true)}><Plus size={14} />Ajouter</button>
          </div>
          {I.intervenants.map((n) => (
            <div key={n} className="flex items-center gap-2.5">
              <Avatar name={n} size={28} />
              <div className="min-w-0 flex-1"><div className="font-semibold">{n}</div><div className="text-xs text-stark-120">{ROLES[n]}</div></div>
              {/* RG-C2: an event participant stays in the list */}
              {busy.has(n) ? (
                <Tooltip text="Participe à un évènement de l’AMT">
                  <button type="button" aria-disabled="true" className="icon-btn cursor-not-allowed rounded-full text-stark-40 hover:bg-transparent" aria-label={`${n} participe à un évènement : retrait impossible`}><X size={12} strokeWidth={2.5} /></button>
                </Tooltip>
              ) : (
                <button type="button" className="icon-btn rounded-full text-stark-100" aria-label={`Retirer ${n} des intervenants`}
                  onClick={() => a.setInfoNow("intervenants", I.intervenants.filter((x) => x !== n), "Intervenants", ["Intervenant retiré", n, null])}><X size={12} strokeWidth={2.5} /></button>
              )}
            </div>
          ))}
          {!I.intervenants.length && <p className="m-0 text-stark-100">Aucun intervenant.</p>}
        </section>

        <section aria-labelledby="h-docs" className="card">
          <div className="flex items-center justify-between gap-2">
            <h3 id="h-docs" className="card-title"><Paperclip size={18} className="text-stark-120" />Documents
              <span className="rounded bg-stark-05 px-1.5 text-[11px] font-semibold text-stark-120">{docs.length}</span>
            </h3>
            <label className={chip}>
              <Plus size={14} />Ajouter
              <input type="file" multiple aria-label="Ajouter des documents" className="absolute inset-0 w-full cursor-pointer opacity-0"
                onChange={(e) => { const fl = Array.from(e.target.files || []); if (fl.length) a.addDocs(fl.map((x) => ({ name: x.name, by: ME, d: TODAY, size: fsize(x.size) }))); e.target.value = ""; }} />
            </label>
          </div>
          {docs.map((d) => (
            <div key={d.ev ? `ev-${d.ev.id}` : `doc-${d.i}`} className="flex items-center gap-2.5 rounded-md border border-stark-20 py-1.5 pr-1.5 pl-2.5">
              <FileText size={18} className="flex-none text-stark-120" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold" title={d.name}>{d.name}</div>
                <div className="text-xs text-stark-120">{d.by} · {fmt(d.d)} · {d.size}</div>
                {d.ev && <div className="truncate text-xs text-stark-120" title={d.ev.title}>Compte rendu · {d.ev.title}</div>}
              </div>
              <button type="button" className="icon-btn" aria-label={`Consulter ${d.name}`} onClick={() => a.flash("Aperçu non reproduit dans ce prototype")}><Eye size={15} /></button>
              <button type="button" className="icon-btn" aria-label={`Télécharger ${d.name}`} onClick={() => a.flash("Téléchargement non reproduit dans ce prototype")}><Download size={15} /></button>
              {d.i !== undefined && <button type="button" className="icon-btn text-stark-100" aria-label={`Retirer ${d.name}`} onClick={() => a.removeDoc(d.i!)}><X size={12} strokeWidth={2.5} /></button>}
            </div>
          ))}
          {!docs.length && <p className="m-0 text-stark-100">Aucun document pour l’instant.</p>}
        </section>
      </div>
      {editPeople && <IntervenantsDialog a={a} onClose={() => setEditPeople(false)} />}
    </div>
  );
}

/** "Modifier les intervenants", as in the original AMT dialog: one checkbox per person, at least one required */
function IntervenantsDialog({ a, onClose }: { a: Amt; onClose: () => void }) {
  const [sel, setSel] = useState(a.info.intervenants);
  const busy = new Set(a.events.map((e) => e.who));
  const [err, setErr] = useState(false);
  const save = () => {
    if (!sel.length) return setErr(true);
    const old = a.info.intervenants;
    const next = PEOPLE.filter((p) => sel.includes(p));
    if (next.join() !== old.join()) {
      a.setInfo("intervenants", next);
      a.log("Modification des intervenants", old.join(", ") || "—", next.join(", "));
      a.flash("Intervenants modifiés", () => a.setInfo("intervenants", old));
    }
    onClose();
  };
  return (
    <Modal title="Modifier les intervenants" width={460} onClose={onClose}
      footer={<><button type="button" className="btn" onClick={onClose}>Annuler</button><button type="button" className="btnp" onClick={save}>Enregistrer</button></>}>
      <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
        <legend className="mb-1 p-0 font-semibold text-stark-120">Intervenants *</legend>
        <div className="flex flex-col gap-2">
          {PEOPLE.map((p) => (
            <label key={p} className="inline-flex cursor-pointer items-start gap-2">
              <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-raven-100" checked={sel.includes(p)} disabled={busy.has(p)}
                onChange={(e) => { setSel(e.target.checked ? [...sel, p] : sel.filter((x) => x !== p)); setErr(false); }} />
              {p} <span className="text-stark-120">({ROLES[p]})</span>
              {busy.has(p) && <span className="text-xs text-stark-100">· participe à un évènement</span>}
            </label>
          ))}
        </div>
        {err && <span className="mt-1 flex items-center gap-1 text-[11px] text-allen-120"><CircleAlert size={14} />Sélectionnez au moins une option</span>}
      </fieldset>
    </Modal>
  );
}
