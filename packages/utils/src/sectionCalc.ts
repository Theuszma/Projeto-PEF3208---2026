export type ProfileType = 'retangular' | 'perfil-i';

export interface SectionConfig {
  type: ProfileType; b: number; h: number; tw?: number; tf?: number;
}

export interface SectionResult {
  area: number; ycg: number; inertia: number;
}

export function calculateSectionProperties(config: SectionConfig): SectionResult {
  let area = 0, ycg = 0, inertia = 0;
  if (config.type === 'retangular') {
    area = config.b * config.h;
    ycg = config.h / 2;
    inertia = (config.b * Math.pow(config.h, 3)) / 12;
  } else if (config.type === 'perfil-i') {
    const { b, h, tw = 1, tf = 1 } = config;
    const hw = h - 2 * tf;
    area = 2 * (b * tf) + tw * hw;
    ycg = h / 2;
    inertia = 2 * ((b * Math.pow(tf, 3) / 12) + (b * tf) * Math.pow((h / 2) - (tf / 2), 2)) + (tw * Math.pow(hw, 3)) / 12;
  }
  return { area, ycg, inertia };
}

export function calculateFlexuralStresses(maxMomentKgfm: number, section: SectionResult, totalHeightCm: number) {
  if (section.inertia === 0) return { sigmaTop: 0, sigmaBottom: 0 };
  const momentKgfCm = maxMomentKgfm * 100;
  const sigmaTop = - (momentKgfCm * section.ycg) / section.inertia;
  const sigmaBottom = (momentKgfCm * (totalHeightCm - section.ycg)) / section.inertia;
  return { sigmaTop, sigmaBottom };
}

// NOVA FUNÇÃO: Tensão de Cisalhamento (Fórmula de Jourawski)
export function calculateShearStresses(maxShearKgf: number, config: SectionConfig, section: SectionResult) {
  if (section.area === 0 || section.inertia === 0) return { tauMax: 0 };
  let tauMax = 0;

  if (config.type === 'retangular') {
    // Para secção retangular, a tensão máxima é 1.5x a tensão média (3V/2A)
    tauMax = (1.5 * maxShearKgf) / section.area;
  } else if (config.type === 'perfil-i') {
    const { b, h, tw = 1, tf = 1 } = config;
    // Cálculo do Momento Estático (Q) na Linha Neutra para o Perfil I
    const yTop = h / 2;
    const Q_flange = (b * tf) * (yTop - tf / 2);
    const hw_half = yTop - tf;
    const Q_web = (tw * hw_half) * (hw_half / 2);
    const Q_max = Q_flange + Q_web;
    
    // tau = V * Q / (I * b_alma)
    tauMax = (maxShearKgf * Q_max) / (section.inertia * tw);
  }
  return { tauMax };
}