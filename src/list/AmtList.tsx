import {
  BookOpen, Building2, CalendarDays, CalendarClock, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown,
  CircleHelp, FolderClock, Heart, HousePlus, LayoutGrid, ListFilter, MailCheck, MessageSquare, MoreHorizontal,
  Paperclip, Phone, PhoneCall, Search, Settings, ShieldCheck, Sparkles, User, UserCog, FileText, FolderKanban,
} from "lucide-react";
import type { ReactNode } from "react";
import { AMTS, STATUS_STYLE, type AmtSummary } from "../data/amts";

const NAV_GROUPS: ReactNode[][] = [
  [<LayoutGrid />, <CalendarDays />],
  [<Building2 />, <FolderClock />, <MailCheck />],
  [<FolderKanban />, <FileText />, <PhoneCall />],
  ["AMT", <BookOpen />],
  [<HousePlus />, <UserCog />, <Settings />, <MoreHorizontal />],
];

const FILTERS: { l: string; n: string; bold?: boolean; active?: boolean; sub?: boolean; chevron?: boolean; sep?: boolean }[] = [
  { l: "Prioritaires", n: "49", bold: true },
  { l: "En retard", n: "208", bold: true, sep: true },
  { l: "AMT actives", n: "1 654", bold: true, active: true },
  { l: "A faire", n: "465", sub: true },
  { l: "En cours", n: "976", sub: true },
  { l: "A valider", n: "156", sub: true },
  { l: "Validé", n: "57", sub: true, sep: true },
  { l: "Suspendues", n: "168", bold: true, sep: true },
  { l: "Terminées 2026", n: "3 293", bold: true },
  { l: "Terminées 2025", n: "4 309", bold: true },
  { l: "Terminées avant", n: "16 930", bold: true, sep: true },
  { l: "Abandonnées 2026", n: "365", bold: true, chevron: true },
  { l: "Abandonnées 2025", n: "296", bold: true },
  { l: "Abandonnées avant", n: "1 147", bold: true },
];

const GRID = "grid grid-cols-[minmax(0,1.45fr)_minmax(0,1.5fr)_90px_minmax(0,1fr)_150px] gap-x-4";

export function AmtList({ onOpen }: { onOpen: (amt: AmtSummary) => void }) {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex flex-1 gap-11 bg-canvas px-[62px] pt-8 pb-24">
          <FilterPanel />
          <main className="min-w-0 flex-1">
            <div className={`${GRID} mb-3 items-center rounded-xl bg-white px-5 py-2 text-[15px] font-semibold text-stark-120`}>
              <span>AMT</span>
              <span>Périmètre</span>
              <span className="inline-flex items-center gap-1">Eff. <ChevronsUpDown size={14} /></span>
              <span>Intervenants</span>
              <span className="flex items-center justify-end">
                <span className="flex h-10 items-center overflow-hidden rounded-lg border border-stark-40 text-stark-180">
                  <span className="flex h-full items-center gap-6 px-3 font-normal">Création <ChevronDown size={16} /></span>
                  <span className="flex h-full items-center border-l border-stark-40 px-2"><ChevronsUpDown size={16} /></span>
                </span>
              </span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {AMTS.map((a) => <AmtCard key={a.id} amt={a} onOpen={() => onOpen(a)} />)}
            </ul>
          </main>
        </div>
        <Pagination />
      </div>
    </div>
  );
}

function SideNav() {
  return (
    <nav aria-label="Navigation principale" className="sticky top-0 flex h-screen w-[74px] flex-none flex-col items-center gap-3 bg-nav py-3 text-white">
      <span className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-raven-100 text-base font-semibold">LD</span>
      {NAV_GROUPS.map((group, i) => (
        <div key={i} className="flex flex-col items-center gap-2 border-t border-white/15 pt-3 first:border-0 first:pt-0">
          {group.map((icon, j) =>
            icon === "AMT" ? (
              <span key={j} className="inline-flex h-11 w-12 items-center justify-center rounded-lg bg-raven-100 text-sm font-bold">AMT</span>
            ) : (
              <span key={j} className="inline-flex h-10 w-10 items-center justify-center rounded-lg opacity-90 hover:bg-white/10 [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
            ),
          )}
        </div>
      ))}
      <div className="mt-auto flex flex-col items-center gap-3">
        <CircleHelp size={28} />
        <span className="rounded-md bg-bishop-100 px-1.5 py-1 text-sm font-semibold">FuturA</span>
      </div>
    </nav>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="flex h-[60px] items-end gap-11 border-b border-stark-20 px-[62px] text-[17px]">
        <span className="pb-4 font-semibold">AMT</span>
        <span className="border-b-[3px] border-raven-100 pb-[13px] font-semibold">Suivi des AMT</span>
        <span className="pb-4 text-stark-120">Demandes et rappels</span>
      </div>
      <div className="flex h-[76px] items-center gap-3 border-b border-stark-20 px-[62px] text-[16px]">
        <button type="button" className="inline-flex h-11 items-center gap-2 rounded-lg bg-stark-05 px-4 font-semibold text-stark-120"><Heart size={20} /> Sauvegarder les filtres</button>
        <span className="mx-1 h-7 w-px bg-stark-20" />
        <button type="button" className="h-9 rounded-md border border-stark-40 px-3 text-stark-120">Intervenant</button>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-stark-40 px-3 text-stark-120"><ListFilter size={18} /> Plus de filtres</button>
        <label className="ml-auto flex h-11 w-[410px] items-center gap-2 rounded-lg border border-stark-40 px-3 text-stark-100">
          <Search size={20} />
          <input placeholder="Rechercher par titre ou numéro d’AMT" className="w-full border-0 bg-transparent outline-none placeholder:text-stark-100" />
        </label>
        <button type="button" className="h-11 rounded-lg border border-stark-40 px-4 font-semibold text-stark-120">Gérer les modèles</button>
        <button type="button" className="inline-flex h-11 items-center gap-3 rounded-lg bg-raven-100 px-4 font-semibold text-white">Nouvelle AMT <ChevronDown size={18} /></button>
      </div>
    </header>
  );
}

function FilterPanel() {
  return (
    <aside className="sticky top-[168px] w-[382px] flex-none self-start rounded-2xl bg-white p-4 text-[17px] shadow-[0_1px_2px_rgba(0,18,53,.08)]">
      {FILTERS.map((f) => (
        <div key={f.l} className={f.sep ? "mb-2 border-b border-stark-20 pb-2" : ""}>
          <div className={`flex items-center justify-between rounded-lg px-3 py-[9px] ${f.active ? "bg-raven-05 text-raven-100" : ""} ${f.sub ? "pl-9" : ""}`}>
            <span className={`flex items-center gap-3 ${f.bold ? "font-semibold" : ""}`}>
              {f.chevron && <ChevronRight size={16} className="-ml-1" />}
              {f.l}
            </span>
            <span className={f.active ? "" : "text-stark-120"}>{f.n}</span>
          </div>
        </div>
      ))}
    </aside>
  );
}

function AmtCard({ amt, onOpen }: { amt: AmtSummary; onOpen: () => void }) {
  const st = STATUS_STYLE[amt.status];
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
        aria-label={`Ouvrir l’AMT #${amt.id} · ${amt.title}`}
        className="cursor-pointer overflow-hidden rounded-xl border border-stark-20 bg-white text-[17px] transition-shadow hover:shadow-md"
      >
        <div className={`${GRID} min-h-[110px] px-4 pt-3 pb-4`}>
          <div className="min-w-0">
            <div className="font-semibold">{amt.title}</div>
            <div className="text-[15px] font-semibold text-raven-100">{amt.type}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate">{amt.company} <span className="text-raven-100">{amt.companyCode}</span></div>
            <div className="truncate">{amt.sector}</div>
            {amt.employee && <div className="flex items-center gap-2"><User size={16} className="fill-stark-120 text-stark-120" /> {amt.employee}</div>}
          </div>
          <div>{amt.eff}</div>
          <div className="min-w-0">
            {amt.intervenants.map((n, i) => (
              <div key={n} className="flex items-center gap-2">
                <span className="truncate">{n}</span>
                {i === 1 && amt.extraIntervenants && <span className="rounded bg-raven-05 px-1.5 text-[15px] font-semibold text-raven-100">+{amt.extraIntervenants}</span>}
              </div>
            ))}
          </div>
          <div className="text-right">{amt.created}</div>
        </div>
        <div className="flex h-[54px] items-center gap-2 border-t border-stark-20 px-5">
          <span className="rounded bg-stark-05 px-2 py-0.5">#{amt.id}</span>
          <span className="rounded px-2 py-0.5" style={{ background: st.bg, color: st.fg }}>{amt.status}</span>
          {amt.ai && <span className="inline-flex items-center gap-1 rounded bg-bishop-05 px-2 py-0.5"><Sparkles size={16} className="text-bishop-100" /> {amt.ai}</span>}
          {(amt.hasEvent || amt.hasPrevention) && <span className="mx-1 h-6 w-px bg-stark-20" />}
          {amt.hasEvent && <span className="inline-flex h-8 w-9 items-center justify-center rounded bg-turquoise-05 text-[#067a85]"><CalendarClock size={18} /></span>}
          {amt.hasPrevention && <span className="inline-flex h-8 w-9 items-center justify-center rounded bg-turquoise-05 text-[#067a85]"><ShieldCheck size={18} className="fill-[#067a85] text-[#067a85]" /></span>}
          <span className="ml-auto flex items-center gap-4 text-stark-120 [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5">
            <span><Phone size={16} /> <b className="font-normal text-stark-180">{amt.counts.calls}</b></span>
            <span><MessageSquare size={16} className="fill-stark-120" /> <b className="font-normal text-stark-180">{amt.counts.comments}</b></span>
            <span><Paperclip size={16} /> <b className="font-normal text-stark-180">{amt.counts.files}</b></span>
            <span><CalendarDays size={16} /> <b className="font-normal text-stark-180">{amt.counts.events}</b></span>
          </span>
          <span className="mx-2 h-6 w-px bg-stark-20" />
          <button type="button" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 font-semibold text-stark-120">Actions <ChevronDown size={16} /></button>
        </div>
      </div>
    </li>
  );
}

function Pagination() {
  return (
    <div className="pointer-events-none fixed right-0 bottom-6 left-[74px] flex justify-center">
      <div className="pointer-events-auto ml-[426px] flex h-14 w-[1090px] items-center gap-4 rounded-xl bg-white px-4 text-[17px] text-stark-120 shadow-md">
        <span>Afficher</span>
        <span className="flex items-center gap-1 rounded-lg border border-stark-20 p-1">
          <span className="rounded bg-raven-05 px-2 font-semibold text-raven-100">25</span>
          <span className="px-2">50</span>
          <span className="px-2">100</span>
        </span>
        <span className="ml-auto flex items-center gap-5">
          <ChevronLeft size={18} className="opacity-50" />
          <span className="rounded bg-raven-05 px-2 font-semibold text-raven-100">1</span>
          <span>2</span><span>3</span><span>4</span><span>5</span><span>…</span><span>67</span>
          <ChevronRight size={18} />
        </span>
        <span className="ml-auto"><b className="text-raven-100">1-25</b> sur 1654</span>
      </div>
    </div>
  );
}
