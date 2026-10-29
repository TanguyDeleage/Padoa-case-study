import { ChevronDown, CircleAlert, Search } from "lucide-react";
import { useRef, useState } from "react";
import { perimOptions, type PerimKind } from "./perimeter";
import { Backdrop, Modal } from "./ui";
import type { Amt } from "./useAmt";

/** "Modifier le périmètre", as in the original AMT dialog: Adhérents or Salariés, multi-select + mass selection */
export function PerimeterDialog({ a, onClose }: { a: Amt; onClose: () => void }) {
  const [kind, setKind] = useState<PerimKind>(a.perim.kind);
  const [sel, setSel] = useState<Record<PerimKind, string[]>>({
    adh: a.perim.kind === "adh" ? a.perim.ids : [a.amt.companyCode],
    sal: a.perim.kind === "sal" ? a.perim.ids : [],
  });
  const [open, setOpen] = useState<DOMRect | null>(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState(false);
  const field = useRef<HTMLButtonElement>(null);

  const opts = perimOptions(a.amt, kind);
  const ids = sel[kind];
  const chosen = opts.filter((o) => ids.includes(o.id));
  const shown = opts.filter((o) => `${o.name} ${o.sub}`.toLowerCase().includes(q.trim().toLowerCase()));
  const title = kind === "adh" ? "Adhérents" : "Salariés";
  const set = (next: string[]) => { setSel({ ...sel, [kind]: opts.map((o) => o.id).filter((id) => next.includes(id)) }); setErr(false); };
  const save = () => {
    if (!ids.length) return setErr(true);
    a.setPerim({ kind, ids });
    onClose();
  };
  const tab = (k: PerimKind, l: string) => (
    <button type="button" role="tab" aria-selected={kind === k} onClick={() => { setKind(k); setOpen(null); setErr(false); }}
      className={`h-8 flex-1 rounded border-0 font-semibold ${kind === k ? "bg-raven-05 text-raven-100" : "bg-transparent text-stark-120 hover:text-stark-180"}`}>{l}</button>
  );

  return (
    <Modal title="Modifier le périmètre" width={640} onClose={onClose}
      footer={<><button type="button" className="btn" onClick={onClose}>Annuler</button><button type="button" className="btnp" onClick={save}>Enregistrer</button></>}>
      <div role="tablist" className="flex gap-1 rounded-md border border-stark-40 p-1">
        {tab("adh", "Adhérents")}
        {tab("sal", "Salariés")}
      </div>
      <div className="flex flex-col gap-1">
        <span id="perim-l" className="font-semibold text-stark-120">{title} *</span>
        <div className="flex gap-2">
          <button ref={field} type="button" aria-labelledby="perim-l" aria-haspopup="listbox" aria-expanded={!!open}
            onClick={() => { setQ(""); setOpen(open ? null : field.current!.getBoundingClientRect()); }}
            className={`field flex h-8 min-w-0 flex-1 items-center gap-2 text-left ${err ? "border-allen-100" : ""}`}>
            <span className={`min-w-0 flex-1 truncate ${chosen.length ? "" : "text-stark-100"}`}>{chosen[0]?.label ?? `Sélectionnez des ${title.toLowerCase()}`}</span>
            {chosen.length > 0 && <span className="rounded bg-raven-05 px-1.5 text-xs font-semibold text-raven-120">{chosen.length}</span>}
            <ChevronDown size={16} className="flex-none text-stark-120" />
          </button>
          <button type="button" className="btn" title={`Sélectionner tous les ${title.toLowerCase()}`} onClick={() => set(opts.map((o) => o.id))}>Sélection en masse</button>
        </div>
        {err && <span className="mt-1 flex items-center gap-1 text-[11px] text-allen-120"><CircleAlert size={14} />Sélectionnez au moins une option</span>}
      </div>

      {open && (
        <>
          <Backdrop onClose={() => setOpen(null)} />
          <div className="menu fixed z-50 max-h-72 overflow-auto" style={{ top: open.bottom + 4, left: open.left, width: open.width }}>
            <label className="mb-1 flex items-center gap-2 border-b border-stark-20 px-2.5 pb-1.5">
              <Search size={14} className="flex-none text-stark-120" />
              <input autoFocus className="h-7 min-w-0 flex-1 border-0 bg-transparent focus:outline-none" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <div role="listbox" aria-multiselectable="true" aria-labelledby="perim-l">
              {shown.map((o) => (
                <label key={o.id} role="option" aria-selected={ids.includes(o.id)} className="menuitem cursor-pointer items-start">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-raven-100" checked={ids.includes(o.id)}
                    onChange={(e) => set(e.target.checked ? [...ids, o.id] : ids.filter((x) => x !== o.id))} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{o.name}</span>
                    <span className="block truncate text-xs text-stark-120">{o.sub}</span>
                  </span>
                </label>
              ))}
              {!shown.length && <p className="m-0 px-2.5 py-2 text-stark-100">Aucun résultat</p>}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
