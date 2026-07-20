import { textWidth } from "./helvetica-metrics";

/**
 * Which text does a stored rect actually correspond to?
 *
 * If the rect matches the FULL sentence but textContent is short, the geometry
 * is right and the text capture is broken. If the rect matches the SHORT text,
 * the selection genuinely ended there and the bug is upstream of storage.
 */
const PAGE_W = 612;
const storedW = 0.4597312307822525 * PAGE_W;

const candidates = {
  "stored textContent": "The trouble with outcome goals is that they ar",
  "full sentence": "The trouble with outcome goals is that they are borrowed.",
  "sentence, no period": "The trouble with outcome goals is that they are borrowed",
};

console.log("stored rect width:", storedW.toFixed(1), "pt\n");
for (const [name, text] of Object.entries(candidates)) {
  const w = textWidth(text, 11);
  console.log(
    `${name.padEnd(22)} ${w.toFixed(1).padStart(6)} pt   delta ${(w - storedW).toFixed(1)}`
  );
}
