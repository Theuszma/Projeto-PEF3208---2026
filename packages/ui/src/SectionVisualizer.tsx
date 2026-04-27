import React from 'react';

export interface SectionVisualizerProps {
  type: 'retangular' | 'perfil-i'; 
  b: number; 
  h: number; 
  tw?: number; 
  tf?: number;
  ycg: number; 
  sigmaTop: number; 
  sigmaBottom: number; 
  tauMax: number;
}

export const SectionVisualizer: React.FC<SectionVisualizerProps> = ({ 
  type, b, h, tw = 1, tf = 1, ycg, sigmaTop, sigmaBottom, tauMax 
}) => {
  // SVG muito mais alto e largo para garantir que nada é cortado
  const svgWidth = 400, svgHeight = 900, padding = 40;
  
  // Aumentámos a área de desenho interno de cada gráfico
  const drawArea = 220; 
  const maxDim = Math.max(b, h) || 1;
  const scale = drawArea / maxDim;

  const drawB = b * scale, drawH = h * scale;
  const drawTw = tw * scale, drawTf = tf * scale;
  const yCgPx = ycg * scale;
  const cx = svgWidth / 2; 

  // Posições Y Centrais espaçadas uniformemente (Garantindo que o último não é cortado)
  const yProf = 80;
  const yStress = 360;
  const yShear = 640;

  const leftX = cx - drawB / 2;
  const maxSigma = Math.max(Math.abs(sigmaTop), Math.abs(sigmaBottom), 1);
  const stressScale = 90 / maxSigma;
  const topStressX = cx + (sigmaTop * stressScale);
  const botStressX = cx + (sigmaBottom * stressScale);
  const tauDrawWidth = tauMax > 0 ? 90 : 0;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block', margin: '0 auto', maxHeight: '800px' }}>
        <defs>
          <pattern id="h" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* --- 1. PERFIL GEOMÉTRICO --- */}
        <text x={cx} y={yProf - 30} fill="#64748b" fontSize="16" fontWeight="bold" textAnchor="middle">Seção Transversal</text>
        {type === 'retangular' ? (
          <rect x={leftX} y={yProf} width={drawB} height={drawH} fill="url(#h)" stroke="#475569" strokeWidth="2" />
        ) : (
          <path d={`M ${leftX} ${yProf} H ${leftX+drawB} V ${yProf+drawTf} H ${cx+drawTw/2} V ${yProf+drawH-drawTf} H ${leftX+drawB} V ${yProf+drawH} H ${leftX} V ${yProf+drawH-drawTf} H ${cx-drawTw/2} V ${yProf+drawTf} Z`} fill="url(#h)" stroke="#475569" strokeWidth="2" />
        )}
        {/* Linha Neutra */}
        <line x1={cx - 140} y1={yProf + yCgPx} x2={cx + 140} y2={yProf + yCgPx} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" />
        <text x={cx - 145} y={yProf + yCgPx + 5} fill="#ef4444" fontSize="14" fontWeight="bold" textAnchor="end">L.N.</text>

        {/* --- 2. TENSÃO NORMAL (Flexão) --- */}
        <text x={cx} y={yStress - 30} fill="#64748b" fontSize="16" fontWeight="bold" textAnchor="middle">Tensão Normal (σ)</text>
        <line x1={cx} y1={yStress - 15} x2={cx} y2={yStress + drawH + 15} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx - 140} y1={yStress + yCgPx} x2={cx + 140} y2={yStress + yCgPx} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
        
        {sigmaTop !== 0 && (
          <g>
            <polygon points={`${cx},${yStress+yCgPx} ${cx},${yStress} ${topStressX},${yStress}`} fill="#fecaca" fillOpacity="0.7" stroke="#dc2626" strokeWidth="1.5" />
            <polygon points={`${cx},${yStress+yCgPx} ${cx},${yStress+drawH} ${botStressX},${yStress+drawH}`} fill="#bfdbfe" fillOpacity="0.7" stroke="#2563eb" strokeWidth="1.5" />
            <line x1={topStressX} y1={yStress} x2={botStressX} y2={yStress+drawH} stroke="#1e293b" strokeWidth="2" />
            <text x={topStressX + (sigmaTop < 0 ? -12 : 12)} y={yStress - 5} fill="#b91c1c" fontSize="16" fontWeight="bold" textAnchor={sigmaTop < 0 ? "end" : "start"}>{sigmaTop.toFixed(1)}</text>
            <text x={botStressX + (sigmaBottom < 0 ? -12 : 12)} y={yStress + drawH + 20} fill="#1d4ed8" fontSize="16" fontWeight="bold" textAnchor={sigmaBottom < 0 ? "end" : "start"}>+{sigmaBottom.toFixed(1)}</text>
          </g>
        )}

        {/* --- 3. TENSÃO DE CISALHAMENTO (Jourawski) --- */}
        <text x={cx} y={yShear - 30} fill="#64748b" fontSize="16" fontWeight="bold" textAnchor="middle">Cisalhamento (τ)</text>
        <line x1={cx} y1={yShear - 15} x2={cx} y2={yShear + drawH + 15} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx - 140} y1={yShear + yCgPx} x2={cx + 140} y2={yShear + yCgPx} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
        
        {tauMax > 0 && (
          <g>
            <path d={`M ${cx},${yShear} Q ${cx+tauDrawWidth},${yShear+yCgPx/2} ${cx+tauDrawWidth},${yShear+yCgPx} Q ${cx+tauDrawWidth},${yShear+drawH-yCgPx/2} ${cx},${yShear+drawH}`} fill="#fef08a" fillOpacity="0.6" stroke="#ca8a04" strokeWidth="1.5" />
            <text x={cx + tauDrawWidth + 12} y={yShear + yCgPx + 6} fill="#a16207" fontSize="16" fontWeight="bold" textAnchor="start">{tauMax.toFixed(2)}</text>
          </g>
        )}
      </svg>
    </div>
  );
};