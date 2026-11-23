document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const formAgendamento =
            document.getElementById(
                "form-agendamento"
            );

        const listaAgendamentos =
            document.getElementById(
                "listaAgendamentos"
            );


        /*
         * Página utilizada pelo cliente.
         */
        if (formAgendamento) {

            const usuario =
                await Auth.exigir([
                    "cliente"
                ]);

            if (!usuario) {
                return;
            }

            iniciarAgendamentoCliente(
                formAgendamento,
                usuario
            );

            return;
        }


        /*
         * Página administrativa/operacional.
         */
        if (listaAgendamentos) {

            const usuario =
                await Auth.exigir([
                    "admin",
                    "funcionario"
                ]);

            if (!usuario) {
                return;
            }

            iniciarGerenciamentoAgendamentos(
                listaAgendamentos
            );
        }
    }
);


/* ============================================================
   API
   ============================================================ */

function formatarErroAgendamento(
    erro
) {

    if (!erro) {
        return "Não foi possível concluir a operação.";
    }

    if (typeof erro === "string") {
        return erro;
    }

    if (Array.isArray(erro)) {

        const mensagens =
            erro
                .map(
                    (item) => {

                        if (typeof item === "string") {
                            return item;
                        }

                        if (item && typeof item === "object") {

                            if (item.msg) {
                                return item.msg;
                            }

                            if (item.message) {
                                return item.message;
                            }

                            if (item.mensagem) {
                                return item.mensagem;
                            }

                            if (item.detail) {
                                return formatarErroAgendamento(
                                    item.detail
                                );
                            }
                        }

                        return null;
                    }
                )
                .filter(Boolean);

        if (mensagens.length) {
            return mensagens.join(" | ");
        }

        return "Não foi possível concluir a operação.";
    }

    if (typeof erro === "object") {

        if (erro.msg) {
            return formatarErroAgendamento(erro.msg);
        }

        if (erro.message) {
            return formatarErroAgendamento(erro.message);
        }

        if (erro.mensagem) {
            return formatarErroAgendamento(erro.mensagem);
        }

        if (erro.detail) {
            return formatarErroAgendamento(erro.detail);
        }
    }

    return "Não foi possível concluir a operação.";
}


async function apiAgendamento(
    resposta
) {

    if (resposta.status === 401) {

        window.location.replace(
            "/login"
        );

        throw new Error(
            "Sua sessão expirou."
        );
    }

    if (!resposta.ok) {

        let mensagem =
            "Não foi possível concluir a operação.";

        try {

            const dados =
                await resposta.json();

            mensagem =
                formatarErroAgendamento(
                    dados.detail ||
                    dados.mensagem ||
                    dados.message ||
                    mensagem
                );

        } catch (erro) {
            console.error(erro);
        }

        throw new Error(mensagem);
    }

    if (resposta.status === 204) {
        return null;
    }

    return await resposta.json();
}


/* ============================================================
   CLIENTE - NOVO AGENDAMENTO
   ============================================================ */

async function iniciarAgendamentoCliente(
    formulario,
    usuario
) {

    /*
     * IDs corretos do agendamento.html (vanilla):
     *
     *   <select id="agendamento_veiculo">   -> antes estava como "veiculo_id"
     *   <input  id="agendamento_data">
     *   <textarea id="agendamento_observacoes">
     *   <div id="mensagemAgendamento">
     *   <div id="listaAgendamentosCliente">
     */
    const selectVeiculo =
        document.getElementById(
            "agendamento_veiculo"
        );

    const campoData =
        document.getElementById(
            "agendamento_data"
        );

    const campoObservacoes =
        document.getElementById(
            "agendamento_observacoes"
        );

    const elementoMensagem =
        document.getElementById(
            "mensagemAgendamento"
        );

    const listaCliente =
        document.getElementById(
            "listaAgendamentosCliente"
        );


    function exibirMensagem(
        texto,
        tipo
    ) {

        if (!elementoMensagem) {
            alert(texto);
            return;
        }

        elementoMensagem.textContent =
            texto || "";

        elementoMensagem.className =
            texto
                ? `mt-3 text-center fw-bold text-${tipo || "danger"}`
                : "mt-3 text-center fw-bold";
    }


    /* --------------------------------------------------------
       Carrega os veículos do cliente logado
       -------------------------------------------------------- */

    async function carregarVeiculos() {

        if (!selectVeiculo) {
            return;
        }

        try {

            const veiculos =
                await apiAgendamento(
                    await fetch(
                        `/clientes/${usuario.id}/veiculos`,
                        {
                            credentials:
                                "same-origin"
                        }
                    )
                );

            selectVeiculo.innerHTML =
                `<option value="">Selecione um veículo</option>`;

            if (!Array.isArray(veiculos) || veiculos.length === 0) {

                selectVeiculo.innerHTML =
                    `<option value="">
                        Nenhum veículo cadastrado — cadastre um na garagem
                     </option>`;

                exibirMensagem(
                    "Você ainda não possui veículos cadastrados. Acesse a garagem para adicionar um.",
                    "danger"
                );

                return;
            }

            veiculos.forEach(
                (veiculo) => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        veiculo.id;

                    option.textContent =
                        `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`;

                    selectVeiculo.appendChild(
                        option
                    );
                }
            );

        } catch (erro) {

            selectVeiculo.innerHTML =
                `<option value="">Erro ao carregar veículos</option>`;

            exibirMensagem(
                erro.message,
                "danger"
            );
        }
    }


    /* --------------------------------------------------------
       Lista os agendamentos já existentes do cliente
       -------------------------------------------------------- */

    async function carregarAgendamentosCliente() {

        if (!listaCliente) {
            return;
        }

        try {

            const agendamentos =
                await apiAgendamento(
                    await fetch(
                        `/clientes/${usuario.id}/agendamentos`,
                        {
                            credentials:
                                "same-origin"
                        }
                    )
                );

            if (!Array.isArray(agendamentos) || agendamentos.length === 0) {

                listaCliente.innerHTML =
                    `<div class="empty-state">
                        Nenhum agendamento cadastrado.
                     </div>`;

                return;
            }

            listaCliente.innerHTML =
                agendamentos
                    .map(
                        (a) => `
                            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                                <div>
                                    <div class="fw-bold">
                                        ${escaparAgendamento(a.modelo)} — ${escaparAgendamento(a.placa)}
                                    </div>
                                    <small class="text-muted">
                                        ${new Date(a.data_hora).toLocaleString("pt-BR")}
                                    </small>
                                </div>
                                <span class="badge bg-secondary">
                                    ${escaparAgendamento(a.status)}
                                </span>
                            </div>
                        `
                    )
                    .join("");

        } catch (erro) {

            listaCliente.innerHTML =
                `<div class="text-danger small">
                    ${escaparAgendamento(erro.message)}
                 </div>`;
        }
    }


    /* --------------------------------------------------------
       Submit do formulário
       -------------------------------------------------------- */

    formulario.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const botao =
                formulario.querySelector(
                    "[type='submit']"
                );

            const dados = {

                veiculo_id:
                    Number(
                        selectVeiculo?.value
                    ),

                data_hora:
                    campoData?.value,

                observacoes:
                    campoObservacoes?.value
                        .trim() || null
            };

            if (!dados.veiculo_id) {

                exibirMensagem(
                    "Selecione um veículo.",
                    "danger"
                );

                return;
            }

            if (!dados.data_hora) {

                exibirMensagem(
                    "Informe a data e o horário.",
                    "danger"
                );

                return;
            }

            try {

                if (botao) {
                    botao.disabled = true;
                }

                exibirMensagem("");

                await apiAgendamento(
                    await fetch(
                        "/agendamentos",
                        {
                            method:
                                "POST",

                            credentials:
                                "same-origin",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    dados
                                )
                        }
                    )
                );

                exibirMensagem(
                    "Agendamento realizado com sucesso!",
                    "success"
                );

                formulario.reset();

                await carregarAgendamentosCliente();

            } catch (erro) {

                exibirMensagem(
                    erro.message,
                    "danger"
                );

            } finally {

                if (botao) {
                    botao.disabled = false;
                }
            }
        }
    );


    /* --------------------------------------------------------
       Inicialização
       -------------------------------------------------------- */

    await Promise.all([
        carregarVeiculos(),
        carregarAgendamentosCliente()
    ]);
}


/* ============================================================
   GERENCIAMENTO DE AGENDAMENTOS
   ============================================================ */

async function iniciarGerenciamentoAgendamentos(
    tabela
) {

    let agendamentos = [];


    const pesquisa =
        document.getElementById(
            "pesquisaAgendamento"
        );


    const filtro =
        document.getElementById(
            "filtroStatusAgendamento"
        );


    const mensagem =
        document.getElementById(
            "mensagemAgendamentos"
        );


    function mostrarMensagem(
        texto
    ) {

        alert(
            formatarErroAgendamento(
                texto
            )
        );
    }


    function formatarData(
        data
    ) {

        if (!data) {
            return "-";
        }

        const objeto =
            new Date(data);

        if (
            Number.isNaN(
                objeto.getTime()
            )
        ) {
            return data;
        }

        return objeto.toLocaleString(
            "pt-BR"
        );
    }


    function renderizar() {

        const termo =
            pesquisa
                ? pesquisa.value
                    .trim()
                    .toLowerCase()
                : "";


        let status =
            filtro
                ? filtro.value
                : "";

        if (status === "pendente") {
            status = "agendado";
        }


        const filtrados =
            agendamentos.filter(
                (agendamento) => {

                    if (
                        status &&
                        String(
                            agendamento.status ??
                            ""
                        )
                            .trim()
                            .toLowerCase() !==
                        String(status)
                            .trim()
                            .toLowerCase()
                    ) {
                        return false;
                    }

                    if (!termo) {
                        return true;
                    }

                    const texto = [
                        agendamento.cliente,
                        agendamento.cliente_nome,
                        agendamento.nome_cliente,
                        agendamento.placa,
                        agendamento.modelo,
                        agendamento.marca
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return texto.includes(
                        termo
                    );
                }
            );


        if (!filtrados.length) {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="text-center text-muted py-4"
                    >
                        Nenhum agendamento encontrado.
                    </td>
                </tr>
            `;

            return;
        }


        tabela.innerHTML =
            filtrados
                .map(
                    (agendamento) => {

                        const cliente =
                            agendamento.cliente_nome ||
                            agendamento.nome_cliente ||
                            agendamento.cliente ||
                            "-";

                        const veiculo =
                            agendamento.veiculo ||
                            [
                                agendamento.marca,
                                agendamento.modelo
                            ]
                                .filter(Boolean)
                                .join(" ") ||
                            agendamento.placa ||
                            "-";

                        return `
                            <tr>
                                <td>${escaparAgendamento(cliente)}</td>
                                <td>
                                    ${escaparAgendamento(veiculo)}
                                    ${
                                        agendamento.placa &&
                                        !String(veiculo).includes(agendamento.placa)
                                            ? `<small class="d-block text-muted">
                                                ${escaparAgendamento(agendamento.placa)}
                                               </small>`
                                            : ""
                                    }
                                </td>
                                <td>${escaparAgendamento(formatarData(agendamento.data_hora))}</td>
                                <td>
                                    <select
                                        class="form-select form-select-sm status-agendamento"
                                        data-id="${escaparAgendamento(agendamento.id)}"
                                    >
                                        ${optionStatus("agendado", "Pendente", agendamento.status)}
                                        ${optionStatus("confirmado", "Confirmado", agendamento.status)}
                                        ${optionStatus("concluido", "Concluído", agendamento.status)}
                                        ${optionStatus("cancelado", "Cancelado", agendamento.status)}
                                    </select>
                                </td>
                                <td>${escaparAgendamento(agendamento.observacoes || "-")}</td>
                            </tr>
                        `;
                    }
                )
                .join("");
    }


    async function carregar() {

        try {

            agendamentos =
                await apiAgendamento(
                    await fetch(
                        "/agendamentos",
                        {
                            credentials:
                                "same-origin"
                        }
                    )
                );

            if (!Array.isArray(agendamentos)) {
                agendamentos = [];
            }

            renderizar();

        } catch (erro) {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="text-center text-danger py-4"
                    >
                        ${escaparAgendamento(erro.message)}
                    </td>
                </tr>
            `;

            mostrarMensagem(erro.message);
        }
    }


    tabela.addEventListener(
        "change",
        async (event) => {

            const select =
                event.target.closest(
                    ".status-agendamento"
                );

            if (!select) {
                return;
            }

            const id =
                select.dataset.id;

            const novoStatus =
                select.value;

            select.disabled = true;

            try {

                await apiAgendamento(
                    await fetch(
                        `/agendamentos/${id}`,
                        {
                            method:
                                "PUT",

                            credentials:
                                "same-origin",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    status:
                                        novoStatus
                                })
                        }
                    )
                );

                const agendamento =
                    agendamentos.find(
                        (item) =>
                            String(item.id) ===
                            String(id)
                    );

                if (agendamento) {
                    agendamento.status =
                        novoStatus;
                }

                mostrarMensagem(
                    "Status atualizado com sucesso."
                );

                renderizar();

            } catch (erro) {

                mostrarMensagem(
                    erro.message
                );

                await carregar();

            } finally {
                select.disabled = false;
            }
        }
    );


    if (pesquisa) {
        pesquisa.addEventListener(
            "input",
            renderizar
        );
    }

    if (filtro) {
        filtro.addEventListener(
            "change",
            renderizar
        );
    }

    await carregar();
}


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function optionStatus(
    valor,
    texto,
    atual
) {

    const valorAtual =
        String(atual ?? "")
            .trim()
            .toLowerCase();

    const valorOption =
        String(valor ?? "")
            .trim()
            .toLowerCase();

    return `
        <option
            value="${valor}"
            ${valorAtual === valorOption ? "selected" : ""}
        >
            ${texto}
        </option>
    `;
}


function escaparAgendamento(
    valor
) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}