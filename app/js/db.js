/**
 * RouteWatch — db.js
 * Camada de persistência usando localStorage como banco de dados.
 * Simula um banco relacional com entidades separadas.
 */

const DB_KEYS = {
  motoristas: 'rw_motoristas',
  gerentes:   'rw_gerentes',
  pontos:     'rw_pontos_cadastro',
  roteiros:   'rw_roteiros',
  parametros: 'rw_parametros',
  usuarios:   'rw_usuarios',
  auditoria:  'rw_auditoria',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function _get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function _getObj(key, defaultVal = {}) {
  try { return JSON.parse(localStorage.getItem(key)) || defaultVal; }
  catch { return defaultVal; }
}

function _set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function _nextId(list) {
  return list.length === 0 ? 1 : Math.max(...list.map(x => x.id)) + 1;
}

function _audit(acao, entidade, id, dados) {
  const log = _get(DB_KEYS.auditoria);
  log.push({ id: _nextId(log), acao, entidade, entidadeId: id, dados, ts: new Date().toISOString() });
  _set(DB_KEYS.auditoria, log);
}

// ── Motoristas ─────────────────────────────────────────────────────────────

const DB = {

  // ── Motoristas ────────────────────────────────────────────────────────
  motoristas: {
    listar() { return _get(DB_KEYS.motoristas); },

    buscar(id) { return this.listar().find(m => m.id === id) || null; },

    salvar(dados) {
      const lista = this.listar();
      const obj = { ...dados, id: _nextId(lista), criadoEm: new Date().toISOString() };
      lista.push(obj);
      _set(DB_KEYS.motoristas, lista);
      _audit('CREATE', 'motorista', obj.id, obj);
      return obj;
    },

    atualizar(id, dados) {
      const lista = this.listar();
      const idx = lista.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Motorista não encontrado');
      lista[idx] = { ...lista[idx], ...dados, atualizadoEm: new Date().toISOString() };
      _set(DB_KEYS.motoristas, lista);
      _audit('UPDATE', 'motorista', id, dados);
      return lista[idx];
    },

    excluir(id) {
      const lista = this.listar().filter(m => m.id !== id);
      _set(DB_KEYS.motoristas, lista);
      _audit('DELETE', 'motorista', id, {});
    },
  },

  // ── Gerentes ──────────────────────────────────────────────────────────
  gerentes: {
    listar() { return _get(DB_KEYS.gerentes); },
    buscar(id) { return this.listar().find(g => g.id === id) || null; },

    salvar(dados) {
      const lista = this.listar();
      const obj = { ...dados, id: _nextId(lista), criadoEm: new Date().toISOString() };
      lista.push(obj);
      _set(DB_KEYS.gerentes, lista);
      _audit('CREATE', 'gerente', obj.id, obj);
      return obj;
    },

    atualizar(id, dados) {
      const lista = this.listar();
      const idx = lista.findIndex(g => g.id === id);
      if (idx === -1) throw new Error('Gerente não encontrado');
      lista[idx] = { ...lista[idx], ...dados, atualizadoEm: new Date().toISOString() };
      _set(DB_KEYS.gerentes, lista);
      _audit('UPDATE', 'gerente', id, dados);
      return lista[idx];
    },

    excluir(id) {
      const lista = this.listar().filter(g => g.id !== id);
      _set(DB_KEYS.gerentes, lista);
      _audit('DELETE', 'gerente', id, {});
    },
  },

  // ── Pontos (cadastro base) ────────────────────────────────────────────
  pontos: {
    listar() { return _get(DB_KEYS.pontos); },
    buscar(id) { return this.listar().find(p => p.id === id) || null; },

    salvar(dados) {
      const lista = this.listar();
      const obj = { ...dados, id: _nextId(lista), criadoEm: new Date().toISOString() };
      lista.push(obj);
      _set(DB_KEYS.pontos, lista);
      _audit('CREATE', 'ponto', obj.id, obj);
      return obj;
    },

    atualizar(id, dados) {
      const lista = this.listar();
      const idx = lista.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Ponto não encontrado');
      lista[idx] = { ...lista[idx], ...dados, atualizadoEm: new Date().toISOString() };
      _set(DB_KEYS.pontos, lista);
      _audit('UPDATE', 'ponto', id, dados);
      return lista[idx];
    },

    excluir(id) {
      const lista = this.listar().filter(p => p.id !== id);
      _set(DB_KEYS.pontos, lista);
      _audit('DELETE', 'ponto', id, {});
    },
  },

  // ── Roteiros ──────────────────────────────────────────────────────────
  roteiros: {
    listar() { return _get(DB_KEYS.roteiros); },

    buscar(id) { return this.listar().find(r => r.id === id) || null; },

    buscarPorMotoristaData(motoristaId, data) {
      return this.listar().find(r => r.motoristaId === motoristaId && r.data === data) || null;
    },

    listarPorMotorista(motoristaId) {
      return this.listar().filter(r => r.motoristaId === motoristaId);
    },

    listarPorPeriodo(dataInicio, dataFim) {
      return this.listar().filter(r => r.data >= dataInicio && r.data <= dataFim);
    },

    salvar(dados) {
      // RN05: validar unicidade motorista+data
      const existente = this.buscarPorMotoristaData(dados.motoristaId, dados.data);
      if (existente) throw new Error('Já existe um roteiro para este motorista nesta data. (RN05)');

      const lista = this.listar();
      const obj = {
        ...dados,
        id: _nextId(lista),
        pontos: dados.pontos || [],          // array de pontos do roteiro
        tempoTotalParadoMin: 0,
        custoEstimado: 0,
        criadoEm: new Date().toISOString(),
      };
      lista.push(obj);
      _set(DB_KEYS.roteiros, lista);
      _audit('CREATE', 'roteiro', obj.id, obj);
      return obj;
    },

    atualizar(id, dados) {
      const lista = this.listar();
      const idx = lista.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Roteiro não encontrado');
      lista[idx] = { ...lista[idx], ...dados, atualizadoEm: new Date().toISOString() };
      _set(DB_KEYS.roteiros, lista);
      _audit('UPDATE', 'roteiro', id, dados);
      return lista[idx];
    },

    excluir(id) {
      const lista = this.listar().filter(r => r.id !== id);
      _set(DB_KEYS.roteiros, lista);
      _audit('DELETE', 'roteiro', id, {});
    },

    // Registra chegada em um ponto do roteiro
    registrarChegada(roteiroId, ordemPonto) {
      const roteiro = this.buscar(roteiroId);
      if (!roteiro) throw new Error('Roteiro não encontrado');
      const ponto = roteiro.pontos.find(p => p.ordem === ordemPonto);
      if (!ponto) throw new Error('Ponto não encontrado no roteiro');
      ponto.dataHoraChegada = new Date().toISOString();
      this.atualizar(roteiroId, { pontos: roteiro.pontos });
      _audit('CHECKIN', 'roteiro_ponto', roteiroId, { ordemPonto, chegada: ponto.dataHoraChegada });
      return ponto;
    },

    // Registra saída em um ponto e calcula tempo parado
    registrarSaida(roteiroId, ordemPonto) {
      const roteiro = this.buscar(roteiroId);
      if (!roteiro) throw new Error('Roteiro não encontrado');
      const ponto = roteiro.pontos.find(p => p.ordem === ordemPonto);
      if (!ponto) throw new Error('Ponto não encontrado no roteiro');

      ponto.dataHoraSaida = new Date().toISOString();

      // RN01 + RN02
      ponto.tempoParadoMin = Calculos.tempoParadoPonto(ponto);

      // RN03 — recalcular total
      roteiro.tempoTotalParadoMin = Calculos.tempoTotalRoteiro(roteiro.pontos);

      // RN07 — recalcular custo
      const params = DB.parametros.get();
      roteiro.custoEstimado = Calculos.custoRoteiro(roteiro.distanciaKm || 0, params);

      this.atualizar(roteiroId, {
        pontos: roteiro.pontos,
        tempoTotalParadoMin: roteiro.tempoTotalParadoMin,
        custoEstimado: roteiro.custoEstimado,
      });

      _audit('CHECKOUT', 'roteiro_ponto', roteiroId, { ordemPonto, saida: ponto.dataHoraSaida, tempoMin: ponto.tempoParadoMin });
      return ponto;
    },
  },

  // ── Parâmetros (singleton) ────────────────────────────────────────────
  parametros: {
    DEFAULTS: {
      valorCombustivel: 6.00,
      kmPorLitro: 12.0,
      custoPorKm: 0.50,
      jornadaPadraoHoras: 8,
      regraTempoParado: 'saida_menos_chegada',
    },

    get() {
      return _getObj(DB_KEYS.parametros, this.DEFAULTS);
    },

    salvar(dados) {
      const atual = this.get();
      const novo = { ...atual, ...dados, atualizadoEm: new Date().toISOString() };
      localStorage.setItem(DB_KEYS.parametros, JSON.stringify(novo));
      _audit('UPDATE', 'parametros', 1, dados);
      return novo;
    },
  },

  // ── Usuários (autenticação) ───────────────────────────────────────────
  usuarios: {
    listar() { return _get(DB_KEYS.usuarios); },

    init() {
      if (this.listar().length === 0) {
        const lista = [
          { id: 1, nome: 'Administrador', email: 'admin@routewatch.com', senha: 'admin123', perfil: 'admin', ativo: true },
          { id: 2, nome: 'Gerente Demo', email: 'gerente@routewatch.com', senha: 'gerente123', perfil: 'gerente', ativo: true },
          { id: 3, nome: 'João Motorista', email: 'joao@routewatch.com', senha: 'motor123', perfil: 'motorista', motoristaId: null, ativo: true },
        ];
        _set(DB_KEYS.usuarios, lista);
      }
    },

    autenticar(email, senha) {
      return this.listar().find(u => u.email === email && u.senha === senha && u.ativo) || null;
    },

    salvar(dados) {
      const lista = this.listar();
      const obj = { ...dados, id: _nextId(lista) };
      lista.push(obj);
      _set(DB_KEYS.usuarios, lista);
      return obj;
    },
  },

  // ── Auditoria ─────────────────────────────────────────────────────────
  auditoria: {
    listar() { return _get(DB_KEYS.auditoria); },
  },

  // ── Seed de dados de exemplo ──────────────────────────────────────────
  seed() {
    DB.usuarios.init();

    if (DB.motoristas.listar().length === 0) {
      const m1 = DB.motoristas.salvar({ nome: 'João Silva', telefone: '31 98888-1111', documento: '123.456.789-00', veiculo: 'Honda CG 160 — Branca', rendimentoKmLitro: 40 });
      const m2 = DB.motoristas.salvar({ nome: 'Maria Santos', telefone: '31 97777-2222', documento: '987.654.321-00', veiculo: 'Yamaha Factor 150 — Vermelha', rendimentoKmLitro: 38 });

      DB.gerentes.salvar({ nome: 'Carlos Gerente', telefone: '31 96666-3333', email: 'carlos@transportadora.com' });

      const p1 = DB.pontos.salvar({ endereco: 'Seg. Família — R. das Flores, 100, BH', latitude: -19.9245, longitude: -43.9352 });
      const p2 = DB.pontos.salvar({ endereco: 'Rua Peru, 55, Santa Efigênia, BH', latitude: -19.9300, longitude: -43.9200 });
      const p3 = DB.pontos.salvar({ endereco: 'Rua X, 5, Lagoinha, BH', latitude: -19.9180, longitude: -43.9500 });
      const p4 = DB.pontos.salvar({ endereco: 'Av. João César, 800, Caiçara, BH', latitude: -19.9100, longitude: -43.9600 });

      // Roteiro de exemplo com tempos já registrados (data no passado)
      const ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
      const dataOntem = ontem.toISOString().split('T')[0];

      const rotA = DB.roteiros.salvar({
        motoristaId: m1.id,
        data: dataOntem,
        distanciaKm: 18.5,
        pontos: [
          { ordem: 1, pontoId: p1.id, endereco: p1.endereco, dataHoraChegada: `${dataOntem}T07:00:00`, dataHoraSaida: `${dataOntem}T07:00:00`, tempoParadoMin: 0 },
          { ordem: 2, pontoId: p2.id, endereco: p2.endereco, dataHoraChegada: `${dataOntem}T07:45:00`, dataHoraSaida: `${dataOntem}T08:00:00`, tempoParadoMin: 15 },
          { ordem: 3, pontoId: p3.id, endereco: p3.endereco, dataHoraChegada: `${dataOntem}T08:30:00`, dataHoraSaida: `${dataOntem}T08:40:00`, tempoParadoMin: 10 },
          { ordem: 4, pontoId: p4.id, endereco: p4.endereco, dataHoraChegada: `${dataOntem}T09:10:00`, dataHoraSaida: `${dataOntem}T10:00:00`, tempoParadoMin: 50 },
        ],
        tempoTotalParadoMin: 75,
        custoEstimado: 9.25,
      });

      // Roteiro do motorista 2
      const rotB = DB.roteiros.salvar({
        motoristaId: m2.id,
        data: dataOntem,
        distanciaKm: 12.0,
        pontos: [
          { ordem: 1, pontoId: p1.id, endereco: p1.endereco, dataHoraChegada: `${dataOntem}T08:00:00`, dataHoraSaida: `${dataOntem}T08:00:00`, tempoParadoMin: 0 },
          { ordem: 2, pontoId: p2.id, endereco: p2.endereco, dataHoraChegada: `${dataOntem}T08:30:00`, dataHoraSaida: `${dataOntem}T08:40:00`, tempoParadoMin: 10 },
          { ordem: 3, pontoId: p3.id, endereco: p3.endereco, dataHoraChegada: `${dataOntem}T09:00:00`, dataHoraSaida: `${dataOntem}T09:05:00`, tempoParadoMin: 5 },
          { ordem: 4, pontoId: p4.id, endereco: p4.endereco, dataHoraChegada: `${dataOntem}T09:30:00`, dataHoraSaida: `${dataOntem}T09:56:00`, tempoParadoMin: 26 },
        ],
        tempoTotalParadoMin: 41,
        custoEstimado: 6.00,
      });

      // Roteiro de hoje (em aberto para demonstração)
      const hoje = new Date().toISOString().split('T')[0];
      DB.roteiros.salvar({
        motoristaId: m1.id,
        data: hoje,
        distanciaKm: 0,
        pontos: [
          { ordem: 1, pontoId: p1.id, endereco: p1.endereco, dataHoraChegada: null, dataHoraSaida: null, tempoParadoMin: 0 },
          { ordem: 2, pontoId: p2.id, endereco: p2.endereco, dataHoraChegada: null, dataHoraSaida: null, tempoParadoMin: null },
          { ordem: 3, pontoId: p3.id, endereco: p3.endereco, dataHoraChegada: null, dataHoraSaida: null, tempoParadoMin: null },
          { ordem: 4, pontoId: p4.id, endereco: p4.endereco, dataHoraChegada: null, dataHoraSaida: null, tempoParadoMin: null },
        ],
        tempoTotalParadoMin: 0,
        custoEstimado: 0,
      });
    }
  },
};
