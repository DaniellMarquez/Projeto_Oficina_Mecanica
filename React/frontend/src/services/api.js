// Cliente HTTP único para o backend FastAPI (via proxy do Vite em /api/*).

async function request(path, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  const temBody = body !== undefined && body !== null;

  const config = {
    method,
    credentials: "include",
    headers: {
      ...(temBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  };
  if (temBody) config.body = JSON.stringify(body);

  const resposta = await fetch(`/api${path}`, config);

  if (resposta.status === 401) {
    const erro = new Error("Sua sessão expirou. Faça login novamente.");
    erro.status = 401;
    throw erro;
  }

  if (resposta.status === 204) return null;

  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try { dados = JSON.parse(texto); } catch { dados = texto; }
  }

  if (!resposta.ok) {
    let mensagem = "Não foi possível concluir a operação.";
    if (dados && (dados.detail || dados.mensagem || dados.message)) {
      mensagem = dados.detail || dados.mensagem || dados.message;
    }
    if (Array.isArray(mensagem)) {
      mensagem = mensagem.map((item) => item?.msg || String(item)).join(" | ");
    }
    const erro = new Error(mensagem);
    erro.status = resposta.status;
    erro.dados = dados;
    throw erro;
  }
  return dados;
}

export const auth = {
  me: () => request("/me"),
  login: (email, senha) => request("/login", { method: "POST", body: { email, senha } }),
  logout: () => request("/logout", { method: "POST" }),
};

export const clientes = {
  listar: () => request("/clientes"),
  cadastrar: (dados) => request("/clientes", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/clientes/${id}`, { method: "PUT", body: dados }),
  inativar: (id) => request(`/clientes/${id}`, { method: "DELETE" }),
  reativar: (id) => request(`/clientes/${id}/reativar`, { method: "PATCH" }),
  totalGasto: (id) => request(`/clientes/${id}/total-gasto`),
  veiculos: (id) => request(`/clientes/${id}/veiculos`),
  ordensServico: (id) => request(`/clientes/${id}/ordens-servico`),
  agendamentos: (id) => request(`/clientes/${id}/agendamentos`),
};

export const funcionarios = {
  listar: () => request("/funcionarios"),
  cadastrar: (dados) => request("/funcionarios", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/funcionarios/${id}`, { method: "PUT", body: dados }),
  inativar: (id) => request(`/funcionarios/${id}`, { method: "DELETE" }),
  reativar: (id) => request(`/funcionarios/${id}/reativar`, { method: "PATCH" }),
  opcoes: () => request("/opcoes-funcionarios"),
};

export const veiculos = {
  listar: () => request("/veiculos"),
  cadastrar: (dados) => request("/veiculos", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/veiculos/${id}`, { method: "PUT", body: dados }),
  excluir: (id) => request(`/veiculos/${id}`, { method: "DELETE" }),
};

export const estoque = {
  listar: () => request("/estoque"),
  cadastrar: (dados) => request("/estoque", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/estoque/${id}`, { method: "PUT", body: dados }),
  inativar: (id) => request(`/estoque/${id}`, { method: "DELETE" }),
  reativar: (id) => request(`/estoque/${id}/reativar`, { method: "PATCH" }),
};

export const servicos = {
  listar: () => request("/servicos"),
  cadastrar: (dados) => request("/servicos", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/servicos/${id}`, { method: "PUT", body: dados }),
  inativar: (id) => request(`/servicos/${id}`, { method: "DELETE" }),
  reativar: (id) => request(`/servicos/${id}/reativar`, { method: "PATCH" }),
};

export const agendamentos = {
  listar: () => request("/agendamentos"),
  cadastrar: (dados) => request("/agendamentos", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/agendamentos/${id}`, { method: "PUT", body: dados }),
};

export const ordens = {
  listar: () => request("/ordens-servico"),
  detalhar: (id) => request(`/ordens-servico/${id}`),
  cadastrar: (dados) => request("/ordens-servico", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/ordens-servico/${id}`, { method: "PUT", body: dados }),
  excluir: (id) => request(`/ordens-servico/${id}`, { method: "DELETE" }),
  adicionarPeca: (osId, dados) => request(`/ordens-servico/${osId}/pecas`, { method: "POST", body: dados }),
  removerPeca: (osId, pecaId, qtd = 1) => request(`/ordens-servico/${osId}/pecas/${pecaId}?quantidade=${qtd}`, { method: "DELETE" }),
  adicionarServico: (osId, dados) => request(`/ordens-servico/${osId}/servicos`, { method: "POST", body: dados }),
  removerServico: (osId, servicoId) => request(`/ordens-servico/${osId}/servicos/${servicoId}`, { method: "DELETE" }),
  finalizar: (osId, metodo_pagamento) => request(`/ordens-servico/${osId}/finalizar`, { method: "PATCH", body: { metodo_pagamento } }),
  listarPagamentos: (osId) => request(`/ordens-servico/${osId}/pagamentos`),
  registrarPagamento: (osId, dados) => request(`/ordens-servico/${osId}/pagamentos`, { method: "POST", body: dados }),
};

export default { auth, clientes, funcionarios, veiculos, estoque, servicos, agendamentos, ordens };
