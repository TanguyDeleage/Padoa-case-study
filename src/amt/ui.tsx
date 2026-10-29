import { X } from "lucide-react";
import type { ReactNode } from "react";
import { ini, pcol } from "./model";
import { ME } from "./useAmt";

export function ErrIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size} className="flex-none">
      <circle cx="12" cy="12" r="10" fill="#e22752" />
      <path d="M12 7v6M12 16.6v.2" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function WarnIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size} className="flex-none">
      <path d="M12 2.5L22.5 21h-21z" fill="#e9792c" />
      <path d="M12 9v5M12 17.4v.2" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Dark label shown above its child on hover or keyboard focus */
export function Tooltip({ text, children, className = "" }: { text: string; children: ReactNode; className?: string }) {
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 rounded bg-stark-180 px-2 py-1 text-xs font-semibold whitespace-pre text-white shadow-md group-focus-within/tip:block group-hover/tip:block">
        {text}
      </span>
    </span>
  );
}

export function Avatar({ name, size = 26, ring = false }: { name: string; size?: number; ring?: boolean }) {
  return (
    <Tooltip text={name} className="flex-none">
      <span
        aria-hidden="true"
        className="inline-flex flex-none items-center justify-center rounded-full font-bold text-white"
        style={{ width: size, height: size, background: pcol(name), fontSize: size < 28 ? 10 : 11, border: ring ? `2px solid ${name === ME ? "#0046da" : "#fff"}` : undefined }}
      >
        {ini(name)}
      </span>
    </Tooltip>
  );
}

/** Up to `max` avatars; beyond that the last slot becomes "+N" for the remaining participants */
export function AvatarStack({ names, max = 3 }: { names: string[]; max?: number }) {
  const shown = names.length > max ? names.slice(0, max - 1) : names;
  const more = names.length - shown.length;
  return (
    <span className="flex">
      {shown.map((n, i) => <span key={n} className={`flex hover:z-10 ${i ? "-ml-1.5" : ""}`}><Avatar name={n} ring /></span>)}
      {more > 0 && (
        <Tooltip text={names.slice(shown.length).join("\n")} className="-ml-1.5 flex-none hover:z-10">
          <span aria-hidden="true" className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white bg-stark-20 text-[10px] font-bold text-stark-120">
            +{more}
          </span>
        </Tooltip>
      )}
    </span>
  );
}

/** Transparent full-screen layer that closes a popover on outside click */
export function Backdrop({ onClose }: { onClose: () => void }) {
  return <button type="button" tabIndex={-1} aria-label="Fermer le menu" onClick={onClose} className="fixed inset-0 z-20 cursor-default border-0 bg-transparent" />;
}

export function Modal({ title, width, onClose, children, footer }: { title: string; width: number; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,18,53,.6)] p-4" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[calc(100vh-32px)] flex-col overflow-auto rounded-lg bg-white shadow-md" style={{ width: `min(${width}px, 100%)` }}>
        <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
          <h2 className="m-0 text-xl font-semibold">{title}</h2>
          <button type="button" className="icon-btn h-8 w-8" aria-label="Fermer" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="flex flex-col gap-3.5 px-5 pt-2 pb-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stark-20 px-5 pt-3 pb-4">{footer}</div>}
      </div>
    </div>
  );
}
