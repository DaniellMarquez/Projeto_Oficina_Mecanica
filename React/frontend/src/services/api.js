const API_URL = "http://127.0.0.1:8000";

export async function listarClientes() {
  const resposta = await fetch(`${API_URL}/clientes`, {
    method: "GET",
    credentials: "include",
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao listar clientes: ${resposta.status}`);
  }

  return resposta.json();
}

export async function cadastrarCliente(cliente) {
  const resposta = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(cliente),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.detail || "Erro ao cadastrar cliente");
  }

  return dados;
}