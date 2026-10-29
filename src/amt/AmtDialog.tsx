import { Briefcase, CalendarDays, CheckCircle2, ChevronDown, Pencil, Printer, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { AmtSummary } from "../data/amts";
import { EventsSection } from "./Events";
import type { AmtEvent } from "./model";
import { Closing } from "./Closing";
import { AddEventMenu, NewEventDialog, type NewEventKind } from "./NewEvent";
import { Overview } from "./Overview";
import { SidePanel } from "./SidePanel";
import { Backdrop, Modal } from "./ui";
import { useAmt } from "./useAmt";

type Dialog =
  | { kind: "delete" }
  | { kind: "info"; what: string }
  | { kind: "event"; editing: AmtEvent }
  | { kind: "newEvent"; ev: NewEventKind };

export function AmtDialog({ amt, onClose }: { amt: AmtSummary; onClose: () => void }) {
  const a = useAmt(amt);
  const [menu, setMenu] = useState(false);
  // ?new=inter|autre or ?edit=<event id> opens the event form directly (handy for demos)
  const [dlg, setDlg] = useState<Dialog | null>(() => {
    const q = new URLSearchParams(location.search);
    const k = q.get("new");
    const e = a.events.find((x) => x.id === q.get("edit"));
    return k === "inter" || k === "autre" ? { kind: "newEvent", ev: k } : e ? { kind: "event", editing: e } : null;
  });
  const [evMenu, setEvMenu] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const pick = (fn: () => void) => () => { setMenu(false); fn(); };
  const notInProto = (what: string) => pick(() => setDlg({ kind: "info", what }));

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-[rgba(0,18,53,.6)]">
      <div className="flex h-8 flex-none items-center justify-end px-1.5">
        <button type="button" aria-label="Fermer le détail de l’AMT" onClick={onClose}
          className="inline-flex h-[22px] w-[22px] items-center justify-center rounded bg-[#2b3a5c] text-white"><X size={14} /></button>
      </div>
      {/* Fixed height: the close bar and header stay put, only the body below scrolls */}
      <div role="dialog" aria-modal="true" aria-labelledby="dlg-h" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl bg-white">
        <header className="relative z-20 flex min-h-14 flex-none flex-wrap items-center justify-between gap-3 border-b border-stark-20 px-6">
          <h2 id="dlg-h" className="m-0 text-[13px] font-semibold">AMT #{amt.id}</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="btn text-raven-100 hover:text-raven-120" onClick={onClose}>Fermer</button>
            <div className="relative">
              <button type="button" className="btnp" aria-expanded={menu} onClick={() => setMenu(!menu)}>Plus d’options <ChevronDown size={14} /></button>
              {menu && (
                <>
                  <Backdrop onClose={() => setMenu(false)} />
                  <div className="menu top-[38px] right-0 min-w-[260px]">
                    <MenuItem icon={<Pencil size={16} />} onClick={notInProto("La modification du type d’actions")}>Modifier le type d’actions</MenuItem>
                    <MenuItem icon={<Briefcase size={16} />} onClick={notInProto("Situations de travail")}>Ajouter une situation de travail</MenuItem>
                    <hr className="my-1 border-0 border-t border-stark-20" />
                    <MenuItem icon={<Printer size={16} />} onClick={notInProto("L’impression")}>Imprimer</MenuItem>
                    <button type="button" className="menuitem text-allen-120" onClick={pick(() => setDlg({ kind: "delete" }))}><Trash2 size={16} className="text-allen-100" />Supprimer l’AMT</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main column and side panel scroll independently; the events table is capped to the visible height (RG-E16) */}
        <div className="flex min-h-0 flex-1">
          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-8 pt-6 pb-6">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Tag icon={<CalendarDays size={14} />}>Action collective</Tag>
              <Tag icon={<ShieldCheck size={14} />}>Prévention primaire</Tag>
            </div>
            <h1 className="m-0 text-xl leading-[1.35] font-semibold">{amt.title}</h1>
            <Overview a={a} />
            <EventsSection a={a} onAdd={setEvMenu} onEdit={(e) => setDlg({ kind: "event", editing: e })} />
            <Closing a={a} />
          </main>
          <SidePanel a={a} />
        </div>
      </div>

      {evMenu && (
        <AddEventMenu anchor={evMenu} onClose={() => setEvMenu(null)} onPick={(k) => {
          setEvMenu(null);
          if (k === "Intervention") setDlg({ kind: "newEvent", ev: "inter" });
          else if (k === "Autre type d’évènement") setDlg({ kind: "newEvent", ev: "autre" });
          else setDlg({ kind: "info", what: k });
        }} />
      )}
      {dlg?.kind === "newEvent" && <NewEventDialog a={a} kind={dlg.ev} onClose={() => setDlg(null)} />}
      {dlg?.kind === "event" && <NewEventDialog a={a} editing={dlg.editing} onClose={() => setDlg(null)} />}

      {dlg?.kind === "delete" && (
        <Modal title="Supprimer cette AMT ?" width={660} onClose={() => setDlg(null)}
          footer={<>
            <button type="button" className="btn" onClick={() => setDlg(null)}>Annuler</button>
            <button type="button" className="btnd" onClick={() => { setDlg(null); a.flash("Suppression non reproduite dans ce prototype"); }}>Supprimer</button>
          </>}>
          <p className="m-0">La suppression de cette AMT est définitive. Vous ne pourrez pas la restaurer par la suite.</p>
        </Modal>
      )}

      {dlg?.kind === "info" && (
        <Modal title="Écran non reproduit" width={460} onClose={() => setDlg(null)}
          footer={<button type="button" className="btnp" onClick={() => setDlg(null)}>J’ai compris</button>}>
          <p className="m-0">{dlg.what} ouvre un formulaire dédié dans padoa. Il n’est pas reproduit dans ce prototype.</p>
        </Modal>
      )}

      {a.toast && (
        <div role="status" className="fixed right-4 bottom-4 z-50 flex max-w-[460px] items-center gap-2.5 rounded-md bg-stark-180 px-3.5 py-2.5 text-white shadow-[0_8px_24px_rgba(0,18,53,.24)]">
          <CheckCircle2 size={18} className="flex-none text-[#7fe0b8]" />
          <span className="flex-1">{a.toast.msg}</span>
          {a.toast.undo && <button type="button" className="border-0 bg-transparent px-1.5 py-1 font-bold text-[#9cc4ff]" onClick={a.undo}>Annuler</button>}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, onClick, children }: { icon: ReactNode; onClick: () => void; children: ReactNode }) {
  return <button type="button" className="menuitem" onClick={onClick}><span className="inline-flex text-stark-120">{icon}</span>{children}</button>;
}

function Tag({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded bg-turquoise-05 px-2 py-0.5 text-[11px] font-semibold">{icon}{children}</span>;
}
