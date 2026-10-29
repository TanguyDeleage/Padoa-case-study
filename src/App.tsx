import { useState } from "react";
import { AmtDialog } from "./amt/AmtDialog";
import { AMTS, type AmtSummary } from "./data/amts";
import { AmtList } from "./list/AmtList";

// ?amt=<id> opens a dialog directly (handy for demos)
const initial = AMTS.find((a) => String(a.id) === new URLSearchParams(location.search).get("amt")) ?? null;

export default function App() {
  const [opened, setOpened] = useState<AmtSummary | null>(initial);
  return (
    <>
      <AmtList onOpen={setOpened} />
      {opened && <AmtDialog key={opened.id} amt={opened} onClose={() => setOpened(null)} />}
    </>
  );
}
