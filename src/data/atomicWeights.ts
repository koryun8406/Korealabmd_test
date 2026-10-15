// Conventional (abridged) standard atomic weights, IUPAC CIAAW.
// TODO(verify): values typed from memory (network to iupac.org / ciaaw.org blocked); re-check against https://ciaaw.org/atomic-weights.htm
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Mg: 24.305,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Fe: 55.845,
  Zn: 65.38,
  Cu: 63.546,
};
export const ATOMIC_WEIGHTS_SOURCE = 'https://ciaaw.org/atomic-weights.htm';
