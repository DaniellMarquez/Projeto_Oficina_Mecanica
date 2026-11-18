
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrdensServico.css";

const API = "http://localhost:8000";

function OrdensServico() {
    const navigate = useNavigate();

    const [ordens, setOrdens] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");
    const [busca, setBusca] = useState("");
    const [modalAberto, setModalAberto] = useState(false);

    const [form, setForm] = useState({
        cliente_id: "",
        veiculo_id: "",
        funcionario_id: "",
        descricao: "",
        observacoes: "",
        status: "Aberta"
    });

    async function carregarOrdens() {
        try {
            const resposta = await fetch(`${API}/ordens-servico`, {
                credentials: "include"
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar as ordens de serviço.");
            }

            const dados = await resposta.json();
            setOrdens(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarOpcoes() {
        try {
            const requisicoes = await Promise.all([
                fetch(`${API}/clientes`, { credentials: "include" }),
                fetch(`${API}/veiculos`, { credentials: "include" }),
                fetch(`${API}/opcoes-funcionarios`, { credentials: "include" })
            ]);

            if (requisicoes.some(r => !r.ok)) {
                throw new Error("Não foi possível carregar clientes, veículos ou funcionários.");
            }

            const [dadosClientes, dadosVeiculos, dadosFuncionarios] =
                await Promise.all(requisicoes.map(r => r.json()));

            setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
            setVeiculos(Array.isArray(dadosVeiculos) ? dadosVeiculos : []);
            setFuncionarios(Array.isArray(dadosFuncionarios) ? dadosFuncionarios : []);

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    useEffect(() => {
        carregarOrdens();
        carregarOpcoes();
    }, []);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setForm(anterior => ({
            ...anterior,
            [name]: value
        }));
    }

    async function cadastrarOrdem(evento) {
        evento.preventDefault();
        setMensagem("");

        try {
            const resposta = await fetch(`${API}/ordens-servico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    ...form,
                    cliente_id: Number(form.cliente_id),
                    veiculo_id: Number(form.veiculo_id),
                    funcionario_id: Number(form.funcionario_id)
                })
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.detail || "Erro ao cadastrar ordem de serviço.");
            }

            setMensagem("Ordem de serviço cadastrada com sucesso!");
            setModalAberto(false);

            setForm({
                cliente_id: "",
                veiculo_id: "",
                funcionario_id: "",
                descricao: "",
                observacoes: "",
                status: "Aberta"
            });

            carregarOrdens();

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    async function excluirOrdem(id) {
        if (!id) {
            setMensagem("Não foi possível identificar esta ordem.");
            return;
        }

        if (!window.confirm("Deseja realmente excluir esta ordem de serviço?")) {
            return;
        }

        try {
            const resposta = await fetch(`${API}/ordens-servico/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.detail || "Erro ao excluir ordem.");
            }

            setMensagem("Ordem excluída com sucesso!");
            carregarOrdens();

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    const ordensFiltradas = ordens.filter(ordem =>
        JSON.stringify(ordem).toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="os-container">

            <header className="os-header">
                <div>
                  <button
    className="os-btn-voltar"
    type="button"
    onClick={() => navigate("/")}
>
    ← Voltar para Home
</button>

                    <h1>Ordens de Serviço</h1>
                    <p>Gerencie os serviços da oficina</p>
                </div>

                <button
                    className="os-btn-novo"
                    onClick={() => setModalAberto(true)}
                >
                    + Nova Ordem
                </button>
            </header>

            {mensagem && (
                <div className="os-mensagem">
                    {mensagem}
                    <button onClick={() => setMensagem("")}>×</button>
                </div>
            )}

            <div className="os-resumo">
                <div className="os-card">
                    <span>Total de ordens</span>
                    <strong>{ordens.length}</strong>
                </div>

                <div className="os-card">
                    <span>Em aberto</span>
                    <strong>
                        {ordens.filter(o =>
                            String(o.status || "").toLowerCase() === "aberta"
                        ).length}
                    </strong>
                </div>

                <div className="os-card">
                    <span>Concluídas</span>
                    <strong>
                        {ordens.filter(o =>
                            ["concluída", "concluida"].includes(
                                String(o.status || "").toLowerCase()
                            )
                        ).length}
                    </strong>
                </div>
            </div>

            <div className="os-lista">
                <div className="os-lista-topo">
                    <h2>Lista de ordens</h2>

                    <input
                        type="text"
                        placeholder="Pesquisar ordem..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                </div>

                {carregando ? (
                    <p className="os-vazio">Carregando ordens...</p>
                ) : ordensFiltradas.length === 0 ? (
                    <p className="os-vazio">
                        Nenhuma ordem de serviço encontrada.
                    </p>
                ) : (
                    <div className="os-tabela-container">
                        <table className="os-tabela">
                            <thead>
                                <tr>
                                    <th>Nº</th>
                                    <th>Cliente</th>
                                    <th>Veículo</th>
                                    <th>Descrição</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ordensFiltradas.map((ordem, indice) => (
                                    <tr key={ordem.id || ordem.os_id || indice}>
                                        <td>
                                            #{ordem.id || ordem.os_id || indice + 1}
                                        </td>

                                        <td>
                                            {ordem.cliente_nome ||
                                                ordem.nome_cliente ||
                                                ordem.cliente_id ||
                                                "-"}
                                        </td>

                                        <td>
                                            {ordem.modelo ||
                                                ordem.veiculo ||
                                                ordem.veiculo_id ||
                                                "-"}
                                        </td>

                                        <td>
                                            {ordem.descricao || ordem.servico || "-"}
                                        </td>

                                        <td>
                                            <span className={`os-status ${String(ordem.status || "Aberta").toLowerCase().replaceAll(" ", "-")}`}>
                                                {ordem.status || "Aberta"}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="os-btn-excluir"
                                                onClick={() =>
                                                    excluirOrdem(ordem.id || ordem.os_id)
                                                }
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalAberto && (
                <div className="os-modal-fundo">
                    <div className="os-modal">

                        <div className="os-modal-topo">
                            <h2>Nova Ordem de Serviço</h2>

                            <button onClick={() => setModalAberto(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={cadastrarOrdem}>

                            <label>Cliente</label>
                            <select
                                name="cliente_id"
                                value={form.cliente_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">Selecione um cliente</option>

                                {clientes.map(c => (
                                    <option
                                        key={c.id || c.cliente_id}
                                        value={c.id || c.cliente_id}
                                    >
                                        {c.nome || c.nome_cliente}
                                    </option>
                                ))}
                            </select>

                            <label>Veículo</label>
                            <select
                                name="veiculo_id"
                                value={form.veiculo_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">Selecione um veículo</option>

                                {veiculos
                                    .filter(v =>
                                        !form.cliente_id ||
                                        String(v.cliente_id) === form.cliente_id
                                    )
                                    .map(v => (
                                        <option
                                            key={v.id || v.veiculo_id}
                                            value={v.id || v.veiculo_id}
                                        >
                                            {v.modelo || v.marca || "Veículo"} - {v.placa || ""}
                                        </option>
                                    ))}
                            </select>

                            <label>Funcionário responsável</label>
                            <select
                                name="funcionario_id"
                                value={form.funcionario_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">Selecione um funcionário</option>

                                {funcionarios.map(f => (
                                    <option
                                        key={f.id || f.funcionario_id}
                                        value={f.id || f.funcionario_id}
                                    >
                                        {f.nome || f.nome_funcionario}
                                    </option>
                                ))}
                            </select>

                            <label>Descrição do serviço</label>
                            <textarea
                                name="descricao"
                                value={form.descricao}
                                onChange={atualizarCampo}
                                placeholder="Descreva o serviço..."
                                required
                            />

                            <label>Observações</label>
                            <textarea
                                name="observacoes"
                                value={form.observacoes}
                                onChange={atualizarCampo}
                                placeholder="Observações adicionais..."
                            />

                            <label>Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={atualizarCampo}
                            >
                                <option value="Aberta">Aberta</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>

                            <div className="os-modal-acoes">
                                <button
                                    type="button"
                                    className="os-btn-cancelar"
                                    onClick={() => setModalAberto(false)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="os-btn-salvar"
                                >
                                    Cadastrar ordem
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default OrdensServico;
