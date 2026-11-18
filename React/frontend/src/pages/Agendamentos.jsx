import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Agendamentos.css";

const API = "http://localhost:8000";

const formularioInicial = {
    veiculo_id: "",
    data_hora: "",
    status: "agendado",
    observacoes: "",
};

function converterDataParaInput(data) {
    if (!data) return "";

    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return "";

    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    const hora = String(d.getHours()).padStart(2, "0");
    const minuto = String(d.getMinutes()).padStart(2, "0");

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function formatarData(data) {
    if (!data) return "—";

    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return data;

    return d.toLocaleString("pt-BR");
}

export default function Agendamentos() {
    const navigate = useNavigate();

    const [agendamentos, setAgendamentos] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [form, setForm] = useState(formularioInicial);
    const [editando, setEditando] = useState(null);
    const [busca, setBusca] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function carregarAgendamentos() {
        try {
            const resposta = await fetch(`${API}/agendamentos`, {
                credentials: "include",
            });

            const dados = await resposta.json().catch(() => []);

            if (!resposta.ok) {
                throw new Error(dados.detail || "Erro ao carregar agendamentos.");
            }

            setAgendamentos(dados);
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        }
    }

    async function carregarVeiculos() {
        try {
            const resposta = await fetch(`${API}/veiculos`, {
                credentials: "include",
            });

            const dados = await resposta.json().catch(() => []);

            if (resposta.ok) {
                setVeiculos(dados);
            }
        } catch {
            setVeiculos([]);
        }
    }

    useEffect(() => {
        carregarAgendamentos();
        carregarVeiculos();
    }, []);

    function alterarCampo(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function iniciarEdicao(agendamento) {
        setEditando(agendamento.id);
        setForm({
            veiculo_id: String(agendamento.veiculo_id),
            data_hora: converterDataParaInput(agendamento.data_hora),
            status: agendamento.status || "agendado",
            observacoes: agendamento.observacoes || "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelarEdicao() {
        setEditando(null);
        setForm(formularioInicial);
    }

    async function salvarAgendamento(e) {
        e.preventDefault();
        setCarregando(true);
        setMensagem("");

        try {
            const resposta = await fetch(`${API}/agendamentos/${editando}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    veiculo_id: Number(form.veiculo_id),
                    data_hora: form.data_hora,
                    status: form.status,
                    observacoes: form.observacoes,
                }),
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.detail || "Não foi possível atualizar o agendamento.");
            }

            setErro(false);
            setMensagem("Agendamento atualizado com sucesso!");
            cancelarEdicao();
            await carregarAgendamentos();
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        } finally {
            setCarregando(false);
        }
    }

    const filtrados = agendamentos.filter((a) =>
        `${a.cliente_nome} ${a.placa} ${a.modelo} ${a.status}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    function classeStatus(status) {
        const valor = String(status || "").toLowerCase();

        if (valor.includes("cancel")) return "cancelado";
        if (valor.includes("conclu")) return "concluido";
        if (valor.includes("confirm")) return "confirmado";

        return "agendado";
    }

    return (
        <main className="tela-agendamentos">
            <header className="agendamentos-topo">
                <button onClick={() => navigate("/")} className="agendamentos-voltar">
                    ← Voltar para Home
                </button>
                <h1>Agendamentos</h1>
                <p>Consulte e gerencie os agendamentos realizados pelos clientes.</p>
            </header>

            {mensagem && (
                <div className={`agendamentos-mensagem ${erro ? "erro" : "sucesso"}`}>
                    {mensagem}
                    <button onClick={() => setMensagem("")}>×</button>
                </div>
            )}

            {editando && (
                <section className="agendamentos-card">
                    <h2>Editar agendamento #{editando}</h2>

                    <form className="agendamentos-form" onSubmit={salvarAgendamento}>
                        <label>
                            Veículo
                            <select name="veiculo_id" value={form.veiculo_id} onChange={alterarCampo} required>
                                <option value="">Selecione o veículo</option>
                                {veiculos.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.placa} — {v.modelo}
                                        {v.cliente_nome ? ` (${v.cliente_nome})` : ""}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Data e horário
                            <input
                                type="datetime-local"
                                name="data_hora"
                                value={form.data_hora}
                                onChange={alterarCampo}
                                required
                            />
                        </label>

                        <label>
                            Status
                            <select name="status" value={form.status} onChange={alterarCampo} required>
                                <option value="agendado">Agendado</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="em_andamento">Em andamento</option>
                                <option value="concluido">Concluído</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </label>

                        <label className="agendamentos-observacoes">
                            Observações
                            <textarea
                                name="observacoes"
                                value={form.observacoes}
                                onChange={alterarCampo}
                                rows="3"
                            />
                        </label>

                        <div className="agendamentos-acoes-form">
                            <button type="submit" disabled={carregando}>
                                {carregando ? "Salvando..." : "Salvar alterações"}
                            </button>
                            <button type="button" className="cancelar" onClick={cancelarEdicao}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="agendamentos-card">
                <div className="agendamentos-lista-topo">
                    <h2>Agendamentos cadastrados</h2>
                    <input
                        placeholder="Buscar por cliente, placa, modelo ou status..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="agendamentos-tabela-container">
                    <table className="agendamentos-tabela">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Veículo</th>
                                <th>Data e horário</th>
                                <th>Status</th>
                                <th>Observações</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrados.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.cliente_nome || "—"}</td>
                                    <td>
                                        <strong>{a.placa}</strong>
                                        <small>{a.modelo}</small>
                                    </td>
                                    <td>{formatarData(a.data_hora)}</td>
                                    <td>
                                        <span className={`agendamentos-status ${classeStatus(a.status)}`}>
                                            {a.status || "Agendado"}
                                        </span>
                                    </td>
                                    <td>{a.observacoes || "—"}</td>
                                    <td>
                                        <button
                                            className="agendamentos-editar"
                                            onClick={() => iniciarEdicao(a)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="agendamentos-vazio">
                                        Nenhum agendamento encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}