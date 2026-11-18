import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Funcionarios.css";

const API = "http://localhost:8000";

const formularioInicial = {
    nome: "",
    cpf: "",
    telefone: "",
    estado_civil: "",
    endereco: "",
    cargo: "",
    email: "",
    senha: "",
};

export default function Funcionarios() {
    const navigate = useNavigate();

    const [funcionarios, setFuncionarios] = useState([]);
    const [form, setForm] = useState(formularioInicial);
    const [editando, setEditando] = useState(null);
    const [busca, setBusca] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function carregarFuncionarios() {
        try {
            const resposta = await fetch(`${API}/funcionarios`, {
                credentials: "include",
            });

            const dados = await resposta.json().catch(() => []);

            if (!resposta.ok) {
                throw new Error(dados.detail || "Erro ao carregar funcionários.");
            }

            setFuncionarios(dados);
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        }
    }

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    function alterarCampo(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function limparFormulario() {
        setForm(formularioInicial);
        setEditando(null);
    }

    function iniciarEdicao(funcionario) {
        setEditando(funcionario.id);
        setForm({
            nome: funcionario.nome || "",
            cpf: funcionario.cpf || "",
            telefone: funcionario.telefone || "",
            estado_civil: funcionario.estado_civil || "",
            endereco: funcionario.endereco || "",
            cargo: funcionario.cargo || "",
            email: funcionario.email || "",
            senha: "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function salvarFuncionario(e) {
        e.preventDefault();
        setCarregando(true);
        setMensagem("");

        const dados = {
            nome: form.nome.trim(),
            cpf: form.cpf.replace(/\D/g, ""),
            telefone: form.telefone.trim(),
            estado_civil: form.estado_civil,
            endereco: form.endereco.trim(),
            cargo: form.cargo.trim(),
            email: form.email.trim(),
        };

        if (!editando) {
            dados.senha = form.senha;
        }

        try {
            const resposta = await fetch(
                editando
                    ? `${API}/funcionarios/${editando}`
                    : `${API}/funcionarios`,
                {
                    method: editando ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(dados),
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(resultado.detail || "Não foi possível salvar o funcionário.");
            }

            setErro(false);
            setMensagem(editando ? "Funcionário atualizado!" : "Funcionário cadastrado!");
            limparFormulario();
            await carregarFuncionarios();
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        } finally {
            setCarregando(false);
        }
    }

    async function alterarSituacao(funcionario) {
        const acao = funcionario.ativo ? "inativar" : "reativar";

        if (!window.confirm(`Deseja realmente ${acao} este funcionário?`)) return;

        try {
            const resposta = await fetch(
                funcionario.ativo
                    ? `${API}/funcionarios/${funcionario.id}`
                    : `${API}/funcionarios/${funcionario.id}/reativar`,
                {
                    method: funcionario.ativo ? "DELETE" : "PATCH",
                    credentials: "include",
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.detail || "Não foi possível alterar a situação.");
            }

            setErro(false);
            setMensagem(`Funcionário ${funcionario.ativo ? "inativado" : "reativado"} com sucesso.`);
            await carregarFuncionarios();
        } catch (e) {
            setErro(true);
            setMensagem(e.message);
        }
    }

    const filtrados = funcionarios.filter((f) =>
        `${f.nome} ${f.cpf} ${f.email} ${f.cargo}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    return (
        <main className="tela-gestao">
            <header className="gestao-topo">
                <button className="gestao-voltar" onClick={() => navigate("/")}>
                    ← Voltar para Home
                </button>
                <h1>Funcionários</h1>
                <p>Controle da equipe de mecânicos e operadores da oficina.</p>
            </header>

            {mensagem && (
                <div className={`gestao-mensagem ${erro ? "mensagem-erro" : "mensagem-sucesso"}`}>
                    {mensagem}
                    <button onClick={() => setMensagem("")}>×</button>
                </div>
            )}

            <section className="gestao-card">
                <h2>{editando ? "Editar funcionário" : "Cadastrar funcionário"}</h2>

                <form className="gestao-formulario" onSubmit={salvarFuncionario}>
                    <label>
                        Nome completo
                        <input name="nome" value={form.nome} onChange={alterarCampo} required />
                    </label>

                    <label>
                        CPF
                        <input name="cpf" value={form.cpf} onChange={alterarCampo} maxLength={14} required />
                    </label>

                    <label>
                        Telefone
                        <input name="telefone" value={form.telefone} onChange={alterarCampo} required />
                    </label>

                    <label>
                        Estado civil
                        <select name="estado_civil" value={form.estado_civil} onChange={alterarCampo} required>
                            <option value="">Selecione</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado(a)">Casado(a)</option>
                            <option value="Divorciado(a)">Divorciado(a)</option>
                            <option value="Viúvo(a)">Viúvo(a)</option>
                            <option value="União estável">União estável</option>
                        </select>
                    </label>

                    <label>
                        Endereço
                        <input name="endereco" value={form.endereco} onChange={alterarCampo} required />
                    </label>

                    <label>
                        Cargo
                        <input name="cargo" value={form.cargo} onChange={alterarCampo} placeholder="Ex.: Mecânico" required />
                    </label>

                    <label>
                        E-mail
                        <input type="email" name="email" value={form.email} onChange={alterarCampo} required />
                    </label>

                    {!editando && (
                        <label>
                            Senha
                            <input type="password" name="senha" value={form.senha} onChange={alterarCampo} minLength={6} required />
                        </label>
                    )}

                    <div className="gestao-acoes-form">
                        <button className="gestao-botao principal" type="submit" disabled={carregando}>
                            {carregando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar funcionário"}
                        </button>

                        {editando && (
                            <button className="gestao-botao secundario" type="button" onClick={limparFormulario}>
                                Cancelar edição
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="gestao-card">
                <div className="gestao-lista-topo">
                    <h2>Equipe cadastrada</h2>
                    <input
                        className="gestao-busca"
                        placeholder="Buscar por nome, CPF, e-mail ou cargo..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="gestao-tabela-container">
                    <table className="gestao-tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Cargo</th>
                                <th>E-mail</th>
                                <th>Situação</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((f) => (
                                <tr key={f.id}>
                                    <td>{f.nome}</td>
                                    <td>{f.cpf}</td>
                                    <td>{f.telefone}</td>
                                    <td>{f.cargo}</td>
                                    <td>{f.email}</td>
                                    <td>
                                        <span className={`gestao-status ${f.ativo ? "ativo" : "inativo"}`}>
                                            {f.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="gestao-botoes-tabela">
                                        <button onClick={() => iniciarEdicao(f)} disabled={!f.ativo}>Editar</button>
                                        <button
                                            className={f.ativo ? "botao-excluir" : "botao-reativar"}
                                            onClick={() => alterarSituacao(f)}
                                        >
                                            {f.ativo ? "Inativar" : "Reativar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filtrados.length === 0 && (
                                <tr><td colSpan="7" className="gestao-vazio">Nenhum funcionário encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}