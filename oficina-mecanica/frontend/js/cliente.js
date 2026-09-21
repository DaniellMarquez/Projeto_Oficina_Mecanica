// ================= PARÂMETRO DA URL =================
// /cadastro-de-cliente         -> cadastro (POST)
// /cadastro-de-cliente?id=5    -> alteração (PUT)

const parametros = new URLSearchParams(window.location.search);
const idCliente = parametros.get("id");

const formulario = document.getElementById("form-cliente");
const mensagem = document.getElementById("mensagem");


function mostrarMensagem(texto, sucesso) {

    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;
    mensagem.className = "mt-3 " + (sucesso ? "text-success" : "text-danger");
}


// ================= MENSAGENS DE ERRO =================

function obterMensagemErro(resultado) {

    if (!resultado || !resultado.detail) {
        return "Dados inválidos.";
    }

    if (Array.isArray(resultado.detail)) {

        return resultado.detail
            .map(erro => {

                const campo = erro.loc?.[1];

                if (campo === "nome") {
                    return "Nome inválido.";
                }

                if (campo === "cpf") {
                    return "CPF inválido.";
                }

                if (campo === "email") {
                    return "E-mail inválido.";
                }

                if (campo === "senha") {
                    return "Senha inválida (use de 6 a 50 caracteres).";
                }

                return erro.msg;
            })
            .join(" ");
    }

    return resultado.detail;
}


// ================= CADASTRO / ALTERAÇÃO =================

if (formulario) {

    formulario.addEventListener("submit", async function (evento) {

        evento.preventDefault();

        mostrarMensagem("", true);

        const cliente = {
            nome: document.getElementById("nome").value,
            cpf: document.getElementById("cpf").value,
            email: document.getElementById("email").value
        };

        const senha = document.getElementById("senha").value;

        // No cadastro a senha sempre vai.
        // Na alteração só vai se o usuário digitou uma nova.
        if (!idCliente || senha) {
            cliente.senha = senha;
        }

        try {

            let resposta;

            if (idCliente) {
                resposta = await fetch(`/cliente/${idCliente}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(cliente)
                });
            } else {
                resposta = await fetch("/cliente", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(cliente)
                });
            }

            const resultado = await resposta.json();

            if (resposta.ok) {

                if (idCliente) {
                    mostrarMensagem("Cliente alterado com sucesso!", true);
                    document.getElementById("senha").value = "";
                } else {
                    mostrarMensagem("Cliente cadastrado com sucesso!", true);
                    formulario.reset();
                }

            } else {

                mostrarMensagem("Erro: " + obterMensagemErro(resultado), false);
                console.error("Erro da API:", resultado);

            }

        } catch (erro) {

            mostrarMensagem("Não foi possível conectar ao servidor.", false);
            console.error("Erro de conexão:", erro);

        }
    });
}


async function carregarClienteParaAlteracao() {

    if (!idCliente || !formulario) {
        return;
    }

    try {

        const resposta = await fetch("/cliente");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar clientes.");
        }

        const lista = await resposta.json();

        const cliente = lista.find(item => item.id == idCliente);

        if (!cliente) {
            mostrarMensagem("Cliente não encontrado.", false);
            return;
        }

        document.getElementById("nome").value = cliente.nome;
        document.getElementById("cpf").value = cliente.cpf;
        document.getElementById("email").value = cliente.email;

        // A senha nunca volta da API. Na alteração ela é opcional.
        const campoSenha = document.getElementById("senha");
        campoSenha.required = false;
        campoSenha.placeholder = "Deixe em branco para manter a senha atual";

        document.getElementById("labelSenha").textContent = "Nova senha (opcional)";
        document.getElementById("tituloFormulario").textContent = "Alterar Cliente";
        document.getElementById("btnSalvar").textContent = "Salvar alterações";
        document.title = "Alterar Cliente";

    } catch (erro) {

        console.error("Erro ao carregar cliente:", erro);
        mostrarMensagem("Não foi possível carregar os dados do cliente.", false);

    }
}


// ================= LISTAGEM =================

let clientes = [];

function escaparHtml(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caractere]));
}

function alterarCliente(id) {
    window.location.href = `/cadastro-de-cliente?id=${id}`;
}

async function excluirCliente(id) {

    const cliente = clientes.find(item => item.id === id);
    const nome = cliente ? cliente.nome : "este cliente";

    if (!confirm(`Deseja realmente excluir ${nome}?`)) {
        return;
    }

    try {

        const resposta = await fetch(`/cliente/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (resposta.ok) {

            await carregarClientes();

            if (textoFiltro && textoFiltro.value.trim()) {
                filtrarClientes();
            }

        } else {

            alert("Erro ao excluir: " + obterMensagemErro(resultado));
            console.error("Erro da API:", resultado);

        }

    } catch (erro) {

        alert("Não foi possível conectar ao servidor.");
        console.error("Erro de conexão:", erro);

    }
}

function exibirClientes(listaClientes) {

    const tabela = document.getElementById("listaClientes");

    if (!tabela) {
        return;
    }

    tabela.innerHTML = "";

    if (listaClientes.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;
        return;
    }

    listaClientes.forEach(cliente => {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${escaparHtml(cliente.id)}</td>
            <td>${escaparHtml(cliente.nome)}</td>
            <td>${escaparHtml(cliente.cpf)}</td>
            <td>${escaparHtml(cliente.email)}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-warning btn-sm"
                    onclick="alterarCliente(${Number(cliente.id)})"
                >
                    ✏️ Alterar
                </button>
                <button
                    type="button"
                    class="btn btn-danger btn-sm ms-1"
                    onclick="excluirCliente(${Number(cliente.id)})"
                >
                    🗑️ Excluir
                </button>
            </td>
        `;

        tabela.appendChild(linha);

    });
}

async function carregarClientes() {

    const tabela = document.getElementById("listaClientes");

    if (!tabela) {
        return;
    }

    try {

        const resposta = await fetch("/cliente");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar clientes.");
        }

        clientes = await resposta.json();

        exibirClientes(clientes);

    } catch (erro) {

        console.error("Erro ao carregar clientes:", erro);

        tabela.innerHTML = `
            <tr>
                <td colspan="5">
                    Erro ao carregar os clientes.
                </td>
            </tr>
        `;
    }
}


// ================= FILTRO =================

function filtrarClientes() {

    const campoElemento = document.getElementById("campoFiltro");
    const textoElemento = document.getElementById("textoFiltro");

    if (!campoElemento || !textoElemento) {
        return;
    }

    const campo = campoElemento.value;

    const texto = textoElemento.value
        .toLowerCase()
        .trim();

    const filtrados = clientes.filter(cliente => {

        const valor = cliente[campo];

        if (valor === null || valor === undefined) {
            return false;
        }

        return String(valor)
            .toLowerCase()
            .includes(texto);

    });

    exibirClientes(filtrados);
}

const textoFiltro = document.getElementById("textoFiltro");

if (textoFiltro) {
    textoFiltro.addEventListener("input", filtrarClientes);
}

const campoFiltro = document.getElementById("campoFiltro");

if (campoFiltro) {
    campoFiltro.addEventListener("change", filtrarClientes);
}

const btnLimparFiltro = document.getElementById("btnLimparFiltro");

if (btnLimparFiltro) {

    btnLimparFiltro.addEventListener("click", function () {

        document.getElementById("textoFiltro").value = "";

        exibirClientes(clientes);

    });

}


// ================= INICIALIZAÇÃO =================

carregarClientes();
carregarClienteParaAlteracao();