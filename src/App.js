import { useState, useEffect } from 'react';
import './App.css';

// --- COMPONENTE: FORMULÁRIO ---
function PlayerForm({ onSave, onCancel, initialName = '', initialNumber = '', nextAutoNum }) {
  const [name, setName] = useState(initialName);
  const [number, setNumber] = useState(initialNumber);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialName);
    setNumber(initialNumber || nextAutoNum);
  }, [initialName, initialNumber, nextAutoNum]);

  function handleSubmit(e) {
    e.preventDefault();
    if (number && !/^\d+$/.test(number)) {
      setError('O número deve ser apenas algarismos.');
      return;
    }
    const saved = onSave({ name: name.trim(), number: number.trim() });
    if (saved === 'name') setError('Este nome já está em uso.');
    else if (saved === 'number') setError('Este número já está em uso.');
    else if (saved !== true) setError('Erro ao salvar.');
  }

  return (
    <div className="card-form">
      <h3>{initialName ? 'Editar' : 'Novo'} Jogador</h3>
      <form onSubmit={handleSubmit}>
        <input className="input-field" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input-field" placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
        {error && <div style={{ color: 'red', fontSize: 13, marginBottom: 10 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" type="submit">Salvar</button>
          <button className="btn-secondary" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

// --- COMPONENTE: CONFIGURAÇÃO ---
function GameConfig({ totalPlayers, onStartGame, onBack }) {
  const [wolves, setWolves] = useState(1);
  const [specials, setSpecials] = useState({ vidente: false, medico: false, cacador: false, bruxa: false });

  const maxWolves = Math.max(1, Math.floor(totalPlayers * 0.4));
  const toggle = (key) => setSpecials(prev => ({ ...prev, [key]: !prev[key] }));
  const selectedSpecials = Object.values(specials).filter(Boolean).length;
  const villagersCount = totalPlayers - wolves - selectedSpecials;

  return (
    <div className="container">
      <h2>Configurar Papéis</h2>
      <div style={{ background: '#333', padding: 15, borderRadius: 10, textAlign: 'left', color: 'white' }}>
        <p>Lobisomens: 
          <input 
            type="number" min="1" max={maxWolves} 
            value={wolves} 
            onChange={e => setWolves(Math.min(maxWolves, parseInt(e.target.value) || 1))} 
            style={{width: 50, marginLeft: 10}} 
          />
          <br/><small style={{color: '#aaa'}}>Máximo para {totalPlayers} jogadores: {maxWolves}</small>
        </p>
        <hr/>
        <label><input type="checkbox" checked={specials.vidente} onChange={() => toggle('vidente')} /> 👁️ Vidente</label><br/>
        <label><input type="checkbox" checked={specials.medico} onChange={() => toggle('medico')} /> 🛡️ Médico</label><br/>
        <label><input type="checkbox" checked={specials.cacador} onChange={() => toggle('cacador')} /> 🏹 Caçador</label><br/>
        <label><input type="checkbox" checked={specials.bruxa} onChange={() => toggle('bruxa')} /> 🧪 Bruxa</label>
      </div>
      <p style={{marginTop: 15}}>Aldeões Simples: <strong>{villagersCount}</strong></p>
      {villagersCount < 0 ? (
        <p style={{color: 'salmon'}}>Reduza o número de papéis especiais!</p>
      ) : (
        <button className="btn-primary" style={{width: '100%', marginTop: 20}} onClick={() => onStartGame(wolves, specials)}>Distribuir e Começar</button>
      )}
      <button className="btn-secondary" style={{display: 'block', margin: '10px auto'}} onClick={onBack}>Voltar</button>
    </div>
  );
}

// --- COMPONENTE: NOITE ---
function NightPassAndPlay({ players, onNightEnd, witchPotions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [nightData, setNightData] = useState({ 
    wolfTarget: null, protected: null, seen: null, 
    witchHeal: false, witchKill: null, hunterVengeance: null 
  });

  const alivePlayers = players.filter(p => p.alive);
  const currentPlayer = alivePlayers[currentIndex];

  const handleAction = (type, target) => {
    setNightData(prev => ({ ...prev, [type]: target }));
    if (type !== 'seen') advance();
  };

  const advance = () => {
    if (currentIndex < alivePlayers.length - 1) {
      setIsRevealed(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      onNightEnd(nightData);
    }
  };

  return (
    <div className="container night-theme">
      <div style={{ border: '2px solid #444', padding: 20, borderRadius: 15, background: '#111' }}>
        {!isRevealed ? (
          <>
            <p>Passe o celular para:</p>
            <h1>{currentPlayer.name}</h1>
            <h2 style={{color: '#61dafb'}}>#{currentPlayer.number}</h2>
            <button className="btn-primary" style={{width: '100%', marginTop: 20}} onClick={() => setIsRevealed(true)}>ACORDAR</button>
          </>
        ) : (
          <div style={{textAlign: 'center'}}>
            <h2 style={{color: '#9370db'}}>{currentPlayer.role.toUpperCase()}</h2>
            <div className="action-box">
              {currentPlayer.role === 'Lobisomem' && (
                <>
                  <p>Escolha o alvo dos lobos:</p>
                  {alivePlayers.filter(p => p.role !== 'Lobisomem').map(p => (
                    <button key={p.name} className="btn-small" onClick={() => handleAction('wolfTarget', p.name)}>{p.name}</button>
                  ))}
                </>
              )}
              {currentPlayer.role === 'Vidente' && (
                nightData.seen ? (
                  <div>
                    <p>A bola de cristal revela que <strong>{nightData.seen}</strong> é:</p>
                    <h2 style={{color: '#61dafb'}}>{players.find(p => p.name === nightData.seen).role}</h2>
                    <button className="btn-primary" onClick={advance}>Ok, entendi</button>
                  </div>
                ) : (
                  alivePlayers.filter(p => p.name !== currentPlayer.name).map(p => (
                    <button key={p.name} className="btn-small" onClick={() => handleAction('seen', p.name)}>{p.name}</button>
                  ))
                )
              )}
              {currentPlayer.role === 'Médico' && (
                <>
                  <p>Escolha quem proteger de QUALQUER dano:</p>
                  {alivePlayers.map(p => (
                    <button key={p.name} className="btn-small" onClick={() => handleAction('protected', p.name)}>{p.name}</button>
                  ))}
                </>
              )}
              {currentPlayer.role === 'Caçador' && (
                <>
                  <p>Alvo de vingança (se você morrer hoje):</p>
                  {alivePlayers.filter(p => p.name !== currentPlayer.name).map(p => (
                    <button key={p.name} className="btn-small" style={{background: '#a52a2a'}} onClick={() => handleAction('hunterVengeance', p.name)}>{p.name}</button>
                  ))}
                </>
              )}
              {currentPlayer.role === 'Bruxa' && (
                <>
                  <p>Suas Poções:</p>
                  {witchPotions.heal && (
                    <button className="btn-small" style={{background: 'green', display: 'block', width: '100%', marginBottom: 10}} 
                            onClick={() => { setNightData(p => ({...p, witchHeal: true})); advance(); }}>
                      Usar Cura (Salva o alvo dos lobos)
                    </button>
                  )}
                  {witchPotions.poison && (
                      <div style={{marginTop: 10}}>
                        <p>Usar Veneno em:</p>
                        {alivePlayers.map(p => <button key={p.name} className="btn-small" style={{background: 'purple'}} onClick={() => handleAction('witchKill', p.name)}>{p.name}</button>)}
                      </div>
                  )}
                  <button className="btn-secondary" style={{marginTop: 15}} onClick={advance}>Passar Turno</button>
                </>
              )}
              {currentPlayer.role === 'Aldeão' && (
                <>
                  <p>Você é um Aldeão. Não há ações para você.</p>
                  <button className="btn-primary" onClick={advance}>Dormir</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [gamePhase, setGamePhase] = useState('SETUP');
  const [players, setPlayers] = useState([]);
  const [playersWithRoles, setPlayersWithRoles] = useState([]);
  const [lastEvents, setLastEvents] = useState([]);
  const [witchPotions, setWitchPotions] = useState({ heal: true, poison: true });
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const sortPlayers = (arr) => [...arr].sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // CORREÇÃO 1: Numeração Automática Inteligente (Preenche lacunas)
  const getNextAutoNum = () => {
    if (players.length === 0) return "1";
    const nums = players.map(p => parseInt(p.number)).filter(n => !isNaN(n));
    let candidate = 1;
    while (nums.includes(candidate)) {
      candidate++;
    }
    return candidate.toString();
  };

  function handleSave(p) {
    if (players.some((pl, i) => i !== editingIndex && (pl.name.toLowerCase() === p.name.toLowerCase() || pl.number === p.number))) {
        return 'number'; 
    }
    let newPlayers = [...players];
    if (editingIndex !== null) newPlayers[editingIndex] = p;
    else newPlayers.push(p);
    setPlayers(sortPlayers(newPlayers));
    setShowForm(false); setEditingIndex(null);
    return true;
  }

  function startGame(wolves, specials) {
    let roles = Array(wolves).fill('Lobisomem');
    if (specials.vidente) roles.push('Vidente');
    if (specials.medico) roles.push('Médico');
    if (specials.cacador) roles.push('Caçador');
    if (specials.bruxa) roles.push('Bruxa');
    while (roles.length < players.length) roles.push('Aldeão');
    roles = roles.sort(() => Math.random() - 0.5);

    setPlayersWithRoles(players.map((p, i) => ({ ...p, role: roles[i], alive: true })));
    setWitchPotions({ heal: true, poison: true });
    setGamePhase('REVEAL');
  }

  // CORREÇÃO 2: Lógica de Proteção e Vingança
  function handleNightEnd(data) {
    let finalDeaths = new Set();
    let updatedPotions = { ...witchPotions };
    
    const wolfTarget = data.wolfTarget;
    const witchTarget = data.witchKill;
    const protectedPlayer = data.protected;

    // 1. Processar Ataque do Lobo
    if (wolfTarget) {
      let savedByWitch = false;
      if (data.witchHeal) {
        savedByWitch = true;
        updatedPotions.heal = false;
      }
      // O Médico protege contra o Lobo
      if (!savedByWitch && wolfTarget !== protectedPlayer) {
        finalDeaths.add(wolfTarget);
      }
    }

    // 2. Processar Veneno da Bruxa
    if (witchTarget) {
      updatedPotions.poison = false;
      // O Médico protege contra o veneno da Bruxa
      if (witchTarget !== protectedPlayer) {
        finalDeaths.add(witchTarget);
      }
    }

    // 3. VINGANÇA DO CAÇADOR (Ajustado)
    const hunter = playersWithRoles.find(p => p.role === 'Caçador');
    // Se o caçador está na lista de mortos até agora
    if (hunter && finalDeaths.has(hunter.name) && data.hunterVengeance) {
      const vengeanceTarget = data.hunterVengeance;
      
      // REGRA: A vingança do Caçador IGNORA a proteção do médico.
      // Se ele atirou, o alvo morre, ponto final.
      finalDeaths.add(vengeanceTarget);
    }

    // Atualizar estados
    setWitchPotions(updatedPotions);
    setPlayersWithRoles(prev => prev.map(p => 
      finalDeaths.has(p.name) ? { ...p, alive: false } : p
    ));
    setLastEvents(Array.from(finalDeaths));
    setGamePhase('DAY');
  }

  const [revIdx, setRevIdx] = useState(0);
  const [revShow, setRevShow] = useState(false);

  const alive = playersWithRoles.filter(p => p.alive);
  const wCount = alive.filter(p => p.role === 'Lobisomem').length;
  const vCount = alive.length - wCount;
  const isGameOver = playersWithRoles.length > 0 && (wCount === 0 || wCount >= vCount);

  return (
    <div className="App">
      <header className="App-header">
        {gamePhase === 'SETUP' && (
          <div className="container">
            <h2>Aldeia ({players.length} pessoas)</h2>
            {!showForm ? (
              <button className="btn-primary" style={{width: '100%', marginBottom: 20}} onClick={() => setShowForm(true)}>+ Adicionar Jogador</button>
            ) : (
              <PlayerForm 
                onSave={handleSave} 
                onCancel={() => setShowForm(false)} 
                nextAutoNum={getNextAutoNum()}
                initialName={editingIndex !== null ? players[editingIndex].name : ''}
                initialNumber={editingIndex !== null ? players[editingIndex].number : ''}
              />
            )}
            <ul style={{width: '100%', padding: 0}}>
              {players.map((p, i) => (
                <li key={i} className="list-item">
                  <span><strong>#{p.number}</strong> {p.name}</span>
                  <div>
                    <button className="btn-small" onClick={() => {setEditingIndex(i); setShowForm(true)}}>✏️</button>
                    <button className="btn-small" style={{background: '#ff6b6b'}} onClick={() => setPlayers(players.filter((_, idx) => idx !== i))}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
            {players.length >= 3 && !showForm && (
              <button className="btn-primary" style={{background: '#2ecc71', marginTop: 20, width: '100%'}} onClick={() => setGamePhase('CONFIG')}>Configurar Papéis</button>
            )}
          </div>
        )}

        {gamePhase === 'CONFIG' && <GameConfig totalPlayers={players.length} onBack={() => setGamePhase('SETUP')} onStartGame={startGame} />}

        {gamePhase === 'REVEAL' && (
          <div className="container">
             <div style={{border: '3px solid white', padding: 30, borderRadius: 20, background: '#222'}}>
                {!revShow ? (
                  <> <p>Passe para:</p> <h1>{playersWithRoles[revIdx].name}</h1> <h2>#{playersWithRoles[revIdx].number}</h2> </>
                ) : (
                  <> <p>Seu papel secreto:</p> <h1 style={{color: '#61dafb'}}>{playersWithRoles[revIdx].role.toUpperCase()}</h1> </>
                )}
                <button className="btn-primary" style={{marginTop: 30, width: '100%'}} onClick={() => {
                  if(revShow) {
                    if(revIdx < playersWithRoles.length - 1) { setRevIdx(revIdx + 1); setRevShow(false); }
                    else { setRevIdx(0); setRevShow(false); setGamePhase('NIGHT'); }
                  } else setRevShow(true);
                }}>{revShow ? 'OK, ESCONDER' : 'VER MEU PAPEL'}</button>
             </div>
          </div>
        )}

        {gamePhase === 'NIGHT' && <NightPassAndPlay players={playersWithRoles} witchPotions={witchPotions} onNightEnd={handleNightEnd} />}

        {gamePhase === 'DAY' && (
          <div className="container day-theme">
            <h2 style={{color: '#d2691e', borderBottom: '2px solid #ddd', paddingBottom: 10}}>☀️ Relatório da Manhã</h2>
            
            <div style={{margin: '20px 0', minHeight: '60px'}}>
                {lastEvents.length > 0 ? (
                    lastEvents.map(n => <div key={n} style={{background: '#ffcccc', padding: 10, borderRadius: 8, margin: '5px 0', border: '1px solid #f5c6cb'}}>💀 <strong>{n}</strong> foi morto.</div>)
                ) : <p>Uma noite tranquila... Ninguém morreu!</p>}
            </div>

            {isGameOver ? (
                <div style={{background: '#eee', padding: 20, borderRadius: 15, marginTop: 20}}>
                    <h1 style={{color: wCount === 0 ? '#27ae60' : '#c0392b'}}>{wCount === 0 ? '🏆 ALDEIA VENCEU!' : '🐺 LOBOS VENCERAM!'}</h1>
                    <button className="btn-primary" style={{width: '100%'}} onClick={() => {setGamePhase('SETUP'); setPlayersWithRoles([]); setLastEvents([]); setRevIdx(0);}}>Novo Jogo</button>
                </div>
            ) : (
                <>
                    <h3 style={{marginTop: 30}}>Votação da Aldeia:</h3>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center'}}>
                        {alive.map(p => (
                            <button key={p.name} className="btn-small" style={{padding: '12px 15px'}} onClick={() => {
                                setPlayersWithRoles(prev => prev.map(pl => pl.name === p.name ? {...pl, alive: false} : pl));
                                setLastEvents([]); 
                                setGamePhase('NIGHT');
                            }}>{p.name}</button>
                        ))}
                    </div>
                    <button className="btn-secondary" style={{marginTop: 25, width: '100%'}} onClick={() => {setLastEvents([]); setGamePhase('NIGHT');}}>Pular Votação e Dormir 🌙</button>
                </>
            )}
          </div>
        )}
      </header>
    </div>
  );
}