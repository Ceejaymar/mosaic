import { angryGroup, angryNodes } from './angry';
import { calmGroup, calmNodes } from './calm';
import { disgustedGroup, disgustedNodes } from './disgusted';
import { fearfulGroup, fearfulNodes } from './fearful';
import { happyGroup, happyNodes } from './happy';
import { sadGroup, sadNodes } from './sad';
import { surprisedGroup, surprisedNodes } from './surprised';

const ALL_MODULES = [
  { group: happyGroup, nodes: happyNodes },
  { group: surprisedGroup, nodes: surprisedNodes },
  { group: calmGroup, nodes: calmNodes },
  { group: sadGroup, nodes: sadNodes },
  { group: disgustedGroup, nodes: disgustedNodes },
  { group: angryGroup, nodes: angryNodes },
  { group: fearfulGroup, nodes: fearfulNodes },
];

export const FEELINGS_CONTENT = {
  version: 1,
  groups: ALL_MODULES.map((m) => m.group),
  nodes: ALL_MODULES.flatMap((m) => m.nodes),
};
