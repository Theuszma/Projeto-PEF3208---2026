import React, { useState } from 'react';
import { calculateBeam, calculateSectionProperties, calculateFlexuralStresses, calculateShearStresses, ProfileType } from '@repo/utils';
import { ResultCard, BeamVisualizer, SectionVisualizer } from '@repo/ui';

interface PointLoad { force: number; position: number; }
interface DistLoad { force: number; start: number; end: number; }

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);
  const [length, setLength] = useState<number>(10);
  
  const [hasMiddleSupport, setHasMiddleSupport] = useState<boolean>(false);
  const [middleSupportPos, setMiddleSupportPos] = useState<number>(5);

  const [pointLoads, setPointLoads] = useState<PointLoad[]>([{ force: 500, position: 5 }]);
  const [distLoads, setDistLoads] = useState<DistLoad[]>([{ force: 200, start: 0, end: 10 }]);

  const [secType, setSecType] = useState<ProfileType>('retangular');
  const [secB, setSecB] = useState<number>(15); const [secH, setSecH] = useState<number>(40);
  const [secTw, setSecTw] = useState<number>(2); const [secTf, setSecTf] = useState<number>(3);
  const [materialE, setMaterialE] = useState<number>(2100000); 

  const [enableSafety, setEnableSafety] = useState<boolean>(false);
  const [yieldStrength, setYieldStrength] = useState<number>(2500); 

  const [showLegends, setShowLegends] = useState<boolean>(true);

  const updateArr = (arr: any[], setArr: any, idx: number, field: string, val: number) => { const n = [...arr]; n[idx][field] = val; setArr(n); };
  const removeArr = (arr: any[], setArr: any, idx: number) => setArr(arr.filter((_, i) => i !== idx));

  // Motor de Cálculos
  const sectionConfig = { type: secType, b: secB, h: secH, tw: secTw, tf: secTf };
  const sectionResult = calculateSectionProperties(sectionConfig);
  const beamResult = calculateBeam({ length, pointLoads, distLoads, elasticModulus: materialE, inertia: sectionResult.inertia, hasMiddleSupport, middleSupportPos });
  const stressResult = calculateFlexuralStresses(beamResult.maxMoment, sectionResult, secH);
  const shearResult = calculateShearStresses(beamResult.maxShear, sectionConfig, sectionResult);

  // Valor absoluto da Tensão Máxima já calculado corretamente!
  const maxSigmaAbs = Math.max(Math.abs(stressResult.sigmaTop), Math.abs(stressResult.sigmaBottom));
  const safetyFactor = maxSigmaAbs > 0 ? yieldStrength / maxSigmaAbs : 999;
  const isSafe = safetyFactor >= 1.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
      
      <style>{`
        body { margin: 0; padding: 0; box-sizing: border-box; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.15); }
        .btn-primary { background-color: #3b82f6; color: white; }
        .btn-primary:hover { background-color: #2563eb; }
        .btn-success { background-color: #10b981; color: white; }
        .btn-success:hover { background-color: #059669; }
        .btn-dark { background-color: #334155; color: white; }
        .btn-dark:hover { background-color: #1e293b; }
        .btn-danger { background-color: #ef4444; color: white; padding: 4px 8px; font-size: 0.8rem; }
        .input-sm { width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; }
        @media print { .no-print { display: none !important; } body { background-color: white !important; } }
      `}</style>

      <header className="no-print" style={{ backgroundColor: '#1e293b', color: 'white', zIndex: 50, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 'bold' }}>FtoolWeb - PEF3208</h1>
            <p style={{ fontSize: '0.9rem', margin: '4px 0 0 0', color: '#94a3b8' }}>Superposição & Hiperestática</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className={`btn ${isMenuOpen ? 'btn-dark' : 'btn-primary'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? '▲ Ocultar Configurações' : '▼ Expandir Configurações'}
            </button>
            <button className="btn btn-success" onClick={() => window.print()}>🖨️ Exportar PDF</button>
          </div>
        </div>

        {isMenuOpen && (
          <div style={{ backgroundColor: 'white', color: '#334155', padding: '24px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '32px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <div style={{ minWidth: '220px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0' }}>Viga & Material</h3>
              <label style={{ fontSize: '0.85rem' }}>Comprimento (L): <input className="input-sm" type="number" value={length} onChange={e => setLength(Number(e.target.value))} /></label>
              <select className="input-sm" style={{ marginTop: '8px' }} value={materialE} onChange={e => setMaterialE(Number(e.target.value))}>
                <option value={2100000}>Aço (2.1E6)</option><option value={250000}>Concreto (2.5E5)</option><option value={100000}>Madeira (1.0E5)</option>
              </select>
              
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                <label style={{ display: 'flex', gap: '8px', fontWeight: 'bold', color: '#065f46', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={hasMiddleSupport} onChange={e => setHasMiddleSupport(e.target.checked)} /> 3º Apoio (Hiperestática)
                </label>
                {hasMiddleSupport && <label style={{ fontSize: '0.8rem', color: '#065f46', display: 'block', marginTop: '8px' }}>Posição (m): <input className="input-sm" type="number" value={middleSupportPos} onChange={e => setMiddleSupportPos(Number(e.target.value))} /></label>}
              </div>
            </div>

            <div style={{ minWidth: '180px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0' }}>Seção Geométrica</h3>
              <select className="input-sm" value={secType} onChange={e => setSecType(e.target.value as ProfileType)} style={{ marginBottom: '8px' }}>
                <option value="retangular">Retangular</option><option value="perfil-i">Perfil I</option>
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem' }}>b: <input className="input-sm" type="number" value={secB} onChange={e => setSecB(Number(e.target.value))} /></label>
                <label style={{ fontSize: '0.8rem' }}>h: <input className="input-sm" type="number" value={secH} onChange={e => setSecH(Number(e.target.value))} /></label>
                {secType === 'perfil-i' && (
                  <><label style={{ fontSize: '0.8rem' }}>tw: <input className="input-sm" type="number" value={secTw} onChange={e => setSecTw(Number(e.target.value))} /></label>
                  <label style={{ fontSize: '0.8rem' }}>tf: <input className="input-sm" type="number" value={secTf} onChange={e => setSecTf(Number(e.target.value))} /></label></>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ minWidth: '220px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><b style={{color:'#991b1b'}}>Pontuais</b> <button className="btn btn-danger" onClick={() => setPointLoads([...pointLoads, {force:0, position:0}])}>+ Add</button></div>
                {pointLoads.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <input className="input-sm" placeholder="P(kgf)" type="number" value={p.force} onChange={e => updateArr(pointLoads, setPointLoads, idx, 'force', Number(e.target.value))} />
                    <input className="input-sm" placeholder="x(m)" type="number" value={p.position} onChange={e => updateArr(pointLoads, setPointLoads, idx, 'position', Number(e.target.value))} />
                    <button onClick={() => removeArr(pointLoads, setPointLoads, idx)} style={{ border:'none', background:'transparent', color:'#ef4444', fontWeight:'bold', cursor:'pointer' }}>X</button>
                  </div>
                ))}
              </div>
              <div style={{ minWidth: '280px', backgroundColor: '#faf5ff', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><b style={{color:'#6b21a8'}}>Distribuídas</b> <button className="btn btn-danger" style={{backgroundColor:'#a855f7'}} onClick={() => setDistLoads([...distLoads, {force:0, start:0, end:0}])}>+ Add</button></div>
                {distLoads.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <input className="input-sm" placeholder="q" type="number" value={d.force} onChange={e => updateArr(distLoads, setDistLoads, idx, 'force', Number(e.target.value))} />
                    <input className="input-sm" placeholder="Ini" type="number" value={d.start} onChange={e => updateArr(distLoads, setDistLoads, idx, 'start', Number(e.target.value))} />
                    <input className="input-sm" placeholder="Fim" type="number" value={d.end} onChange={e => updateArr(distLoads, setDistLoads, idx, 'end', Number(e.target.value))} />
                    <button onClick={() => removeArr(distLoads, setDistLoads, idx)} style={{ border:'none', background:'transparent', color:'#a855f7', fontWeight:'bold', cursor:'pointer' }}>X</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ minWidth: '200px', backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <label style={{ display: 'flex', gap: '8px', fontWeight: 'bold', color: '#92400e', cursor: 'pointer' }}>
                <input type="checkbox" checked={enableSafety} onChange={e => setEnableSafety(e.target.checked)} /> FS Dimensionamento
              </label>
              {enableSafety && <label style={{ fontSize: '0.8rem', color: '#92400e', display: 'block', marginTop: '8px' }}>fy (kgf/cm²): <input className="input-sm" type="number" value={yieldStrength} onChange={e => setYieldStrength(Number(e.target.value))} /></label>}
              
              <hr style={{ border: 'none', borderTop: '1px solid #fcd34d', margin: '12px 0' }} />
              
              <label style={{ display: 'flex', gap: '8px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={showLegends} onChange={e => setShowLegends(e.target.checked)} /> Mostrar Legendas
              </label>
            </div>

          </div>
        )}
      </header>

      <main style={{ flex: 1, padding: '32px', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
            <BeamVisualizer length={length} pointLoads={pointLoads} distLoads={distLoads} reactionA={beamResult.reactionA} reactionB={beamResult.reactionB} reactionMid={beamResult.reactionMid} reactionMidPos={beamResult.reactionMidPos} diagrams={beamResult.diagrams} maxShear={beamResult.maxShear} maxMoment={beamResult.maxMoment} />
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
            <SectionVisualizer type={secType} b={secB} h={secH} tw={secTw} tf={secTf} ycg={sectionResult.ycg} sigmaTop={stressResult.sigmaTop} sigmaBottom={stressResult.sigmaBottom} tauMax={shearResult.tauMax} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: enableSafety ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '24px' }}>
          <ResultCard title="Esforços Máximos">
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Momento (M)</span><span style={{ fontWeight: 'bold', color: '#b45309' }}>{beamResult.maxMoment.toFixed(1)} kgf.m</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Cortante (V)</span><span style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{beamResult.maxShear.toFixed(1)} kgf</span></div>
          </ResultCard>

          <ResultCard title="Deformação (Serviço)">
             <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Rigidez (EI)</span><span style={{ fontWeight: 'bold', color: '#15803d' }}>{((materialE * sectionResult.inertia) / 10000).toExponential(2)}</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#065f46', fontWeight: 'bold' }}>Flecha Máx</span><span style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.2rem' }}>{beamResult.maxDeflection.toFixed(2)} mm</span></div>
          </ResultCard>

          <ResultCard title="Tensões na Fibra">
             <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Cisalhamento (τ)</span><span style={{ fontWeight: 'bold', color: '#ca8a04' }}>{shearResult.tauMax.toFixed(2)}</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ color: '#64748b' }}>Flexão Máx (σ)</span>
               <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{maxSigmaAbs.toFixed(2)}</span>
             </div>
          </ResultCard>

          {enableSafety && (
            <div style={{ backgroundColor: isSafe ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', padding: '20px', border: `2px solid ${isSafe ? '#22c55e' : '#ef4444'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 12px 0', color: isSafe ? '#166534' : '#991b1b', fontSize: '1.1rem', textAlign: 'center' }}>{isSafe ? '✅ ESTRUTURA SEGURA' : '❌ RISCO DE COLAPSO'}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#475569' }}>Fator de Segurança</span><span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: isSafe ? '#15803d' : '#b91c1c' }}>{safetyFactor.toFixed(2)}</span></div>
            </div>
          )}
        </div>

        {/* PAINEL DE LEGENDAS */}
        {showLegends && (
          <div style={{ marginTop: '32px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '1.2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              📚 Glossário e Legendas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.9rem', color: '#475569' }}>
              <div><strong style={{color:'#3b82f6'}}>Ra / Rb:</strong> Reações de Apoio (kgf) calculadas nas extremidades da viga.</div>
              {hasMiddleSupport && <div><strong style={{color:'#059669'}}>R_mid:</strong> Reação no Apoio Intermediário (kgf) gerada pelo vínculo extra.</div>}
              <div><strong style={{color:'#ef4444'}}>P:</strong> Carga Pontual (kgf). Força concentrada aplicada num único ponto.</div>
              <div><strong style={{color:'#a855f7'}}>q:</strong> Carga Distribuída (kgf/m). Força espalhada ao longo de um trecho da viga.</div>
              <div><strong style={{color:'#1d4ed8'}}>V:</strong> Esforço Cortante (kgf). Força interna que atua paralelamente à seção transversal.</div>
              <div><strong style={{color:'#b45309'}}>M:</strong> Momento Fletor (kgf.m). Esforço interno que causa a flexão/encurvamento.</div>
              <div><strong style={{color:'#059669'}}>v (Flecha Máx):</strong> Deflexão máxima (mm). O ponto onde a viga mais afunda.</div>
              <div><strong style={{color:'#ef4444'}}>L.N.:</strong> Linha Neutra. O eixo horizontal exato onde não há tração nem compressão.</div>
              <div><strong style={{color:'#dc2626'}}>σ (Sigma):</strong> Tensão Normal (kgf/cm²). O esforço de estiramento (+) ou esmagamento (-) das fibras.</div>
              <div><strong style={{color:'#ca8a04'}}>τ (Tau):</strong> Tensão de Cisalhamento (kgf/cm²). O esforço de "corte/escorregamento" interno.</div>
              <div><strong style={{color:'#15803d'}}>EI:</strong> Rigidez à Flexão. A resistência do material (E) vezes a geometria da peça (I).</div>
              {enableSafety && <div><strong style={{color:'#991b1b'}}>FS:</strong> Fator de Segurança. Limite de Escoamento (f_y) dividido pela Tensão Normal Máxima (σ_max).</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;