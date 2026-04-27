export interface PointLoad { force: number; position: number; }
export interface DistLoad { force: number; start: number; end: number; }

export interface BeamInput {
  length: number;
  pointLoads: PointLoad[];
  distLoads: DistLoad[];
  elasticModulus: number;
  inertia: number;
  hasMiddleSupport?: boolean;   // NOVO: Liga/Desliga o 3º Apoio
  middleSupportPos?: number;    // NOVO: Posição do 3º Apoio
}

export interface DiagramPoint { x: number; v: number; m: number; deflection: number; }

export interface BeamResult {
  reactionA: number; reactionB: number; reactionMid?: number; reactionMidPos?: number;
  diagrams: DiagramPoint[]; maxShear: number; maxMoment: number; maxDeflection: number;
}

// Função Auxiliar: Resolve a viga Isostática base (2 apoios)
function calcIsostatic(input: BeamInput): BeamResult {
  const { length, pointLoads, distLoads, elasticModulus, inertia } = input;
  let momentB = 0; let totalVerticalLoad = 0;

  pointLoads.forEach(p => { momentB += p.force * p.position; totalVerticalLoad += p.force; });
  distLoads.forEach(d => {
    const safeStart = Math.max(0, Math.min(d.start, length));
    const safeEnd = Math.max(safeStart, Math.min(d.end, length));
    const Ld = safeEnd - safeStart;
    if (Ld > 0) { const force = d.force * Ld; momentB += force * (safeStart + Ld / 2); totalVerticalLoad += force; }
  });

  const reactionB = momentB / length; const reactionA = totalVerticalLoad - reactionB;
  const steps = 500; const dx = length / steps;
  const xVals: number[] = []; const shears: number[] = []; const moments: number[] = [];
  let maxShear = 0; let maxMoment = 0;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * length;
    let v = reactionA; let m = reactionA * x;
    pointLoads.forEach(p => { if (x >= p.position) { v -= p.force; m -= p.force * (x - p.position); } });
    distLoads.forEach(d => {
      if (x > d.start) {
        const Ld = Math.min(x, d.end) - d.start;
        if (Ld > 0) { const q = d.force * Ld; v -= q; m -= q * (Ld / 2); }
      }
    });
    xVals.push(x); shears.push(v); moments.push(m);
    maxShear = Math.max(maxShear, Math.abs(v)); maxMoment = Math.max(maxMoment, Math.abs(m));
  }

  let theta_0 = 0; let v_0 = 0; const v0_arr: number[] = [0];
  for (let i = 1; i <= steps; i++) {
    const m_avg = (moments[i] + moments[i-1]) / 2;
    theta_0 += m_avg * dx; v_0 += theta_0 * dx; v0_arr.push(v_0);
  }
  const C1 = -v0_arr[steps] / length;
  const EI_m2 = Math.max((elasticModulus * inertia) / 10000, 0.001);

  const diagrams: DiagramPoint[] = []; let maxDeflection = 0;
  for (let i = 0; i <= steps; i++) {
    const defl_mm = -((v0_arr[i] + C1 * xVals[i]) / EI_m2) * 1000;
    diagrams.push({ x: xVals[i], v: shears[i], m: moments[i], deflection: defl_mm });
    if (Math.abs(defl_mm) > Math.abs(maxDeflection)) maxDeflection = defl_mm;
  }
  return { reactionA, reactionB, diagrams, maxShear, maxMoment, maxDeflection };
}

// Função Principal: Deteta e resolve Hiperestática pelo Método das Forças
export function calculateBeam(input: BeamInput): BeamResult {
  if (!input.hasMiddleSupport) return calcIsostatic(input);

  const pos = input.middleSupportPos || input.length / 2;
  const run0 = calcIsostatic(input); // Caso 1: Cargas Externas (Sem apoio central)
  
  const unitInput = { ...input, pointLoads: [{ force: 1000, position: pos }], distLoads: [] };
  const run1 = calcIsostatic(unitInput); // Caso 2: Carga Unitária no meio

  // Encontrar a deflexão na posição exata do apoio
  const stepIdx = Math.max(0, Math.min(500, Math.round((pos / input.length) * 500)));
  const delta0 = run0.diagrams[stepIdx].deflection;
  const delta1 = run1.diagrams[stepIdx].deflection / 1000;

  // Reação necessária para anular a deflexão (R = Delta_0 / Delta_1)
  const rMid = delta1 !== 0 ? delta0 / delta1 : 0; 

  // Caso 3: Superposição final (Cargas externas + Reação do apoio empurrando para cima)
  const finalInput = { ...input, pointLoads: [...input.pointLoads, { force: -rMid, position: pos }] };
  const finalRun = calcIsostatic(finalInput);
  
  finalRun.reactionMid = rMid;
  finalRun.reactionMidPos = pos;
  return finalRun;
}