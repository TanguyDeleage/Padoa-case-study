import type { AmtSummary } from "../data/amts";

export type PerimKind = "adh" | "sal";
/** ids are company codes (adh) or employee names (sal) */
export interface Perim { kind: PerimKind; ids: string[] }
export interface PerimItem { id: string; name: string; sub: string; label: string }

const SAL = [
  ["RAYMOND Laurence", "Opératrice de montage"], ["BERTIN Lucas", "Technicien qualité"], ["CHAUVIN Amélie", "Responsable d’atelier"],
  ["DIALLO Moussa", "Cariste"], ["FONTAINE Claire", "Assistante administrative"],
];
const ADH = [
  ["Atelier Lumière SARL", "A10294", "Bourges · 42 salariés"], ["Menuiserie Lefort", "L12640", "Vierzon · 18 salariés"], ["Imprimerie Nouvelle", "I90512", "Bourges · 27 salariés"],
  ["Ferronnerie Duval", "F61290", "Saint-Amand · 9 salariés"], ["Garage Central Mehun", "G70345", "Mehun-sur-Yèvre · 6 salariés"],
];

export function perimOptions(amt: AmtSummary, kind: PerimKind): PerimItem[] {
  if (kind === "sal") return SAL.map(([n, r]) => ({ id: n, name: n, sub: `${r} · ${amt.company}`, label: n }));
  const own = [amt.company, amt.companyCode, `${amt.eff} salariés`];
  return [own, ...ADH.filter(([, c]) => c !== amt.companyCode)].map(([n, c, s]) => ({ id: c, name: n, sub: `${c} · ${s}`, label: `${n} - ${c}` }));
}

export const perimItems = (amt: AmtSummary, p: Perim) => perimOptions(amt, p.kind).filter((o) => p.ids.includes(o.id));

export const perimLabel = (p: Perim) => {
  const n = p.ids.length;
  return `${n} ${p.kind === "adh" ? "entreprise" : "salarié"}${n > 1 ? "s" : ""}`;
};

/** "Entreprise (code) +N", as in the AMT recap */
export function perimLine(amt: AmtSummary, p: Perim) {
  const items = perimItems(amt, p);
  const more = items.length > 1 ? ` +${items.length - 1}` : "";
  if (p.kind === "sal") return `${amt.company} (${amt.companyCode})${items[0] ? ` - ${items[0].name}${more}` : ""}`;
  return items[0] ? `${items[0].name} (${items[0].id})${more}` : "—";
}
