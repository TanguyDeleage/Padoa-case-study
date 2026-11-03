import { useCallback, useState } from "react";
import { AmtDialog } from "./amt/AmtDialog";
import { seedState, summarize, type AmtState } from "./amt/useAmt";
import { AMTS, type AmtSummary } from "./data/amts";
import { AmtList } from "./list/AmtList";

// ?amt=<id> opens a dialog directly (handy for demos)
const initial = AMTS.find((a) => String(a.id) === new URLSearchParams(location.search).get("amt")) ?? null;

export default function App() {
  const [opened, setOpened] = useState<AmtSummary | null>(initial);
  // Content of each AMT, kept across openings. #41 is the detailed one, so its card reflects it from the start
  const [states, setStates] = useState<Record<number, AmtState>>(() => ({ 41: seedState(AMTS.find((a) => a.id === 41)!) }));
  const save = useCallback((id: number, s: AmtState) => setStates((m) => ({ ...m, [id]: s })), []);
  const amts = AMTS.map((a) => (states[a.id] ? summarize(a, states[a.id]) : a));
  return (
    <>
      <AmtList amts={amts} onOpen={(a) => setOpened(AMTS.find((x) => x.id === a.id)!)} />
      {opened && (
        <AmtDialog key={opened.id} amt={opened} init={states[opened.id] ?? seedState(opened)}
          onChange={save} onClose={() => setOpened(null)} />
      )}
    </>
  );
}
