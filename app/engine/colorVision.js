// VisionCheck — Colour vision classification
// app/engine/colorVision.js
//
// Plates come in kinds, defined by which deficiency cannot separate the figure
// from the background:
//   N  control          visible to everyone (strong lightness + hue difference)
//   S  red-green screen invisible to protan AND deutan vision
//   P  invisible to protan, visible to deutan
//   D  invisible to deutan, visible to protan
//   T  invisible to tritan (blue-yellow), visible to red-green deficient vision
//
// A P plate (invisible to protan, visible to deutan) can only be made moderately
// visible to deutan vision, while D plates are strongly visible to protan vision.
// So a protan result needs the D plates seen, and a deutan result needs P plates
// seen and D plates missed; anything unclear is reported as red-green, type unclear,
// never as the wrong type.
//
// This is a screening pattern, not a diagnosis: it is not clinically validated
// and screen colours vary between phones.

import { ALERT } from './alertLogic';

// responses: [{ kind, correct }]
export const classifyColorVision = (responses) => {
  const missed = { N: 0, S: 0, P: 0, D: 0, T: 0 };
  const total  = { N: 0, S: 0, P: 0, D: 0, T: 0 };
  responses.forEach(({ kind, correct }) => {
    total[kind] += 1;
    if (!correct) missed[kind] += 1;
  });

  if (missed.N > 0) {
    return { type: 'unreliable', blueYellow: false, missed, total, alert: ALERT.YELLOW };
  }

  const redGreen   = missed.S >= 2;
  const blueYellow = missed.T > 0;
  let type = 'none';
  if (redGreen) {
    if (missed.D === 0 && missed.P > 0)      type = 'protan';
    else if (missed.P === 0 && missed.D > 0) type = 'deutan';
    else                                     type = 'redgreen';
  } else if (blueYellow) {
    type = 'blueyellow';
  }

  let alert = ALERT.GREEN;
  if (redGreen)                         alert = ALERT.RED;
  else if (missed.S === 1 || blueYellow) alert = ALERT.YELLOW;

  return { type, blueYellow, missed, total, alert };
};
