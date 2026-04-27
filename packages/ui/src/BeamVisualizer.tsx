import React from 'react';

export interface PointLoad { force: number; position: number; }
export interface DistLoad { force: number; start: number; end: number; }
export interface DiagramPoint { x: number; v: number; m: number; deflection: number; }

export interface BeamVisualizerProps {
  length: number; pointLoads: PointLoad[]; distLoads: DistLoad[];
  reactionA: number; reactionB: number; reactionMid?: number; reactionMidPos?: number;
  diagrams: DiagramPoint[]; maxShear: number; maxMoment: number;
}

export const BeamVisualizer: React.FC<BeamVisualizerProps> = ({
  length, pointLoads, distLoads, reactionA, reactionB, reactionMid, reactionMidPos, diagrams, maxShear, maxMoment
}) => {
  // Aumentámos a altura total para dar espaço a todos os diagramas sem sobreposição
  const svgWidth = 800, svgHeight = 750, paddingX = 80;
  const drawingWidth = svgWidth - 2 * paddingX;
  
  // Coordenadas Y (Aumentámos o espaçamento entre eles)
  const beamY = 160; 
  const decY = 400; 
  const dmfY = 650; 
  
  const safeLength = Math.max(length, 0.1);
  const scaleX = drawingWidth / safeLength;

  const maxV = Math.max(maxShear, 1), maxM = Math.max(maxMoment, 1);
  // Reduzimos um pouco a escala vertical para evitar que os gráficos batam nos títulos
  const scaleV = 50 / maxV, scaleM = 60 / maxM;

  const decPoints = diagrams.map(p => `${paddingX + p.x * scaleX},${decY - p.v * scaleV}`).join(' ');
  const decPolygon = `${paddingX},${decY} ${decPoints} ${paddingX + drawingWidth},${decY}`;

  const dmfPoints = diagrams.map(p => `${paddingX + p.x * scaleX},${dmfY + p.m * scaleM}`).join(' ');
  const dmfPolygon = `${paddingX},${dmfY} ${dmfPoints} ${paddingX + drawingWidth},${dmfY}`;

  const maxDeflection = Math.max(...diagrams.map(d => Math.abs(d.deflection)));
  const deflScale = maxDeflection > 0 ? 30 / maxDeflection : 0;
  const elasticCurvePoints = diagrams.map(p => `${paddingX + p.x * scaleX},${beamY + p.deflection * deflScale}`).join(' ');

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <svg width="100%" height="auto" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block', margin: '0 auto' }}>
        
        {/* TÍTULO AFASTADO PARA CIMA */}
        <text x={paddingX} y={40} fill="#334155" fontSize="18" fontWeight="bold">Esquema Estrutural & Linha Elástica</text>
        
        {/* Viga e Apoios Extremidades */}
        <line x1={paddingX} y1={beamY} x2={paddingX + drawingWidth} y2={beamY} stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
        <polygon points={`${paddingX},${beamY} ${paddingX - 15},${beamY + 25} ${paddingX + 15},${beamY + 25}`} fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
        <line x1={paddingX - 25} y1={beamY + 25} x2={paddingX + 25} y2={beamY + 25} stroke="#475569" strokeWidth="3" />
        <polygon points={`${paddingX + drawingWidth},${beamY} ${paddingX + drawingWidth - 15},${beamY + 20} ${paddingX + drawingWidth + 15},${beamY + 20}`} fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
        <line x1={paddingX + drawingWidth - 25} y1={beamY + 28} x2={paddingX + drawingWidth + 25} y2={beamY + 28} stroke="#475569" strokeWidth="3" />
        
        {/* Apoio Intermediário (Hiperestático) */}
        {reactionMidPos !== undefined && reactionMid !== undefined && (
          <g>
            <polygon points={`${paddingX + reactionMidPos * scaleX},${beamY} ${paddingX + reactionMidPos * scaleX - 15},${beamY + 20} ${paddingX + reactionMidPos * scaleX + 15},${beamY + 20}`} fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
            <line x1={paddingX + reactionMidPos * scaleX - 25} y1={beamY + 28} x2={paddingX + reactionMidPos * scaleX + 25} y2={beamY + 28} stroke="#059669" strokeWidth="3" />
            <text x={paddingX + reactionMidPos * scaleX} y={beamY + 45} fill="#059669" fontSize="12" fontWeight="bold" textAnchor="middle">R_mid={reactionMid.toFixed(1)}</text>
          </g>
        )}

        {/* Linha Elástica */}
        {maxDeflection > 0 && <path d={`M ${paddingX},${beamY} L ${elasticCurvePoints} L ${paddingX + drawingWidth},${beamY}`} fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="8,4" strokeLinejoin="round" />}

        {/* Cargas Distribuídas */}
        {distLoads.map((d, idx) => {
          const s = Math.max(0, Math.min(d.start, safeLength)); const e = Math.max(s, Math.min(d.end, safeLength));
          if (d.force <= 0 || e <= s) return null;
          const w = (e - s) * scaleX; const arr = Math.max(2, Math.floor(w / 20));
          return (
            <g key={`dist-${idx}`}>
              <rect x={paddingX + s * scaleX} y={beamY - 40} width={w} height={25} fill="#c084fc" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2" />
              <text x={paddingX + s * scaleX + w/2} y={beamY - 50} fill="#9333ea" fontSize="14" fontWeight="bold" textAnchor="middle">q={d.force}</text>
              {Array.from({ length: arr + 1 }).map((_, i) => {
                const ax = paddingX + s * scaleX + (i * w) / arr;
                return (<g key={i}><line x1={ax} y1={beamY-40} x2={ax} y2={beamY-15} stroke="#a855f7" strokeWidth="2" /><polygon points={`${ax-4},${beamY-20} ${ax+4},${beamY-20} ${ax},${beamY-15}`} fill="#a855f7" /></g>);
              })}
            </g>
          );
        })}

        {/* Cargas Pontuais */}
        {pointLoads.map((p, idx) => {
          if (p.force <= 0 || p.position < 0 || p.position > safeLength) return null;
          const lx = paddingX + p.position * scaleX;
          return (
            <g key={`point-${idx}`}>
              <line x1={lx} y1={beamY - 80} x2={lx} y2={beamY - 15} stroke="#ef4444" strokeWidth="3" />
              <polygon points={`${lx-6},${beamY-20} ${lx+6},${beamY-20} ${lx},${beamY-5}`} fill="#ef4444" />
              <text x={lx} y={beamY - 90} fill="#ef4444" fontSize="14" fontWeight="bold" textAnchor="middle">P={p.force}</text>
            </g>
          );
        })}
        
        {/* Reações A e B */}
        <text x={paddingX} y={beamY + 45} fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">Ra={reactionA.toFixed(1)}</text>
        <text x={paddingX + drawingWidth} y={beamY + 45} fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">Rb={reactionB.toFixed(1)}</text>

        {/* TÍTULOS E DIAGRAMAS BEM AFASTADOS */}
        <text x={paddingX} y={decY - 80} fill="#334155" fontSize="16" fontWeight="bold">Diagrama de Esforço Cortante (V)</text>
        <polygon points={decPolygon} fill="#3b82f6" fillOpacity="0.15" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
        <line x1={paddingX} y1={decY} x2={paddingX + drawingWidth} y2={decY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
        
        <text x={paddingX} y={dmfY - 80} fill="#334155" fontSize="16" fontWeight="bold">Diagrama de Momento Fletor (M)</text>
        <polygon points={dmfPolygon} fill="#f59e0b" fillOpacity="0.15" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
        <line x1={paddingX} y1={dmfY} x2={paddingX + drawingWidth} y2={dmfY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
      </svg>
    </div>
  );
};