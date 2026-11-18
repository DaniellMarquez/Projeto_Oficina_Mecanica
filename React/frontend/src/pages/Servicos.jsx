import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Servicos.css";

const API = "http://localhost:8000";

export default function Servicos() {
    const navigate = useNavigate();

    const [servicos, setServicos] = useState([]);
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [editando, setEditando] = useState(null);
    const [busca, setBusca] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function carregarServicos() {
        try {
            const resposta = await fetch(`${API}/servicos`, {
                credentials: "include",
            });

            const dados = await resposta.json().catch(() => []);

            if (!resposta.ok) {
                throw new Error(dados.detail || "Erro ao carregar serviços.");
            }

            setServicos(dados);
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        }
    }

    useEffect(() => {
        carregarServicos();
    }, []);

    function limparFormulario() {
        setDescricao("");
        setValor("");
        setEditando(null);
    }

    function iniciarEdicao(servico) {
        setEditando(servico.id);
        setDescricao(servico.descricao);
        setValor(String(servico.valor_mao_obra));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function salvarServico(e) {
        e.preventDefault();
        setCarregando(true);
        setMensagem("");

        try {
            const resposta = await fetch(
                editando
                    ? `${API}/servicos/${editando}`
                    : `${API}/servicos`,
                {
                    method: editando ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        descricao: descricao.trim(),
                        valor_mao_obra: Number(valor),
                    }),
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.detail || "Não foi possível salvar o serviço.");
            }

            setErro(false);
            setMensagem(editando ? "Serviço atualizado com sucesso!" : "Serviço cadastrado com sucesso!");
            limparFormulario();
            await carregarServicos();
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        } finally {
            setCarregando(false);
        }
    }

    async function alterarSituacao(servico) {
        const acao = servico.ativo ? "inativar" : "reativar";

        if (!window.confirm(`Deseja ${acao} este serviço?`)) return;

        try {
            const resposta = await fetch(
                servico.ativo
                    ? `${API}/servicos/${servico.id}`
                    : `${API}/servicos/${servico.id}/reativar`,
                {
                    method: servico.ativo ? "DELETE" : "PATCH",
                    credentials: "include",
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.detail || "Não foi possível alterar o serviço.");
            }

            setErro(false);
            setMensagem(`Serviço ${servico.ativo ? "inativado" : "reativado"} com sucesso!`);
            await carregarServicos();
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        }
    }

    const filtrados = servicos.filter((s) =>
        s.descricao.toLowerCase().includes(busca.toLowerCase())
    );

    function formatarMoeda(numero) {
        return Number(numero || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    return (
        <main className="tela-servicos">
            <header className="servicos-topo">
                <button onClick={() => navigate("/")} className="servicos-voltar">
                    ← Voltar para Home
                </button>
                <h1>Serviços</h1>
                <p>Cadastro e gerenciamento dos serviços oferecidos pela oficina.</p>
            </header>

            {mensagem && (
                <div className={`servicos-mensagem ${erro ? "erro" : "sucesso"}`}>
                    {mensagem}
                    <button onClick={() => setMensagem("")}>×</button>
                </div>
            )}

            <section className="servicos-card">
                <h2>{editando ? "Editar serviço" : "Cadastrar novo serviço"}</h2>

                <form onSubmit={salvarServico} className="servicos-form">
                    <label>
                        Descrição do serviço
                        <input
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex.: Troca de óleo"
                            required
                        />
                    </label>

                    <label>
                        Valor da mão de obra (R$)
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="0,00"
                            required
                        />
                    </label>

                    <div className="servicos-acoes-form">
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar serviço"}
                        </button>

                        {editando && (
                            <button type="button" className="servicos-cancelar" onClick={limparFormulario}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="servicos-card">
                <div className="servicos-lista-topo">
                    <h2>Serviços cadastrados</h2>
                    <input
                        placeholder="Buscar serviço..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="servicos-tabela-container">
                    <table className="servicos-tabela">
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Valor da mão de obra</th>
                                <th>Situação</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.descricao}</td>
                                    <td>{formatarMoeda(s.valor_mao_obra)}</td>
                                    <td>
                                        <span className={`servicos-status ${s.ativo ? "ativo" : "inativo"}`}>
                                            {s.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="servicos-botoes">
                                        <button onClick={() => iniciarEdicao(s)} disabled={!s.ativo}>
                                            Editar
                                        </button>
                                        <button
                                            className={s.ativo ? "inativar" : "reativar"}
                                            onClick={() => alterarSituacao(s)}
                                        >
                                            {s.ativo ? "Inativar" : "Reativar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filtrados.length === 0 && (
                                <tr><td colSpan="4" className="servicos-vazio">Nenhum serviço encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}