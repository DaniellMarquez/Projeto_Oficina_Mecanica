import { useEffect, useState } from "react";
import "./Gestao.css";

const API = "http://localhost:8000";

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState("");
    const [modal, setModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    const formularioInicial = {
        nome: "",
        cpf: "",
        email: "",
        senha: ""
    };

    const [form, setForm] = useState(formularioInicial);

    async function carregarClientes() {
        try {
            const resposta = await fetch(`${API}/clientes`, {
                credentials: "include"
            });

            if (!resposta.ok) {
                throw new Error(
                    resposta.status === 403
                        ? "Somente administradores podem acessar os clientes."
                        : "Erro ao carregar clientes."
                );
            }

            setClientes(await resposta.json());
        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarClientes();
    }, []);

    function abrirCadastro() {
        setEditando(null);
        setForm(formularioInicial);
        setModal(true);
    }

    function abrirEdicao(cliente) {
        setEditando(cliente);
        setForm({
            nome: cliente.nome || "",
            cpf: cliente.cpf || "",
            email: cliente.email || "",
            senha: ""
        });
        setModal(true);
    }

    function atualizarCampo(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function salvarCliente(e) {
        e.preventDefault();
        setMensagem("");

        const url = editando
            ? `${API}/clientes/${editando.id}`
            : `${API}/clientes`;

        const metodo = editando ? "PUT" : "POST";

        const dados = editando
            ? {
                nome: form.nome,
                cpf: form.cpf,
                email: form.email
            }
            : {
                nome: form.nome,
                cpf: form.cpf,
                email: form.email,
                senha: form.senha
            };

        try {
            const resposta = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail || "Não foi possível salvar o cliente."
                );
            }

            setMensagem(
                editando
                    ? "Cliente atualizado com sucesso!"
                    : "Cliente cadastrado com sucesso!"
            );

            setModal(false);
            setForm(formularioInicial);
            carregarClientes();
        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    async function alterarSituacao(cliente) {
        const acao = cliente.ativo ? "inativar" : "reativar";

        if (!window.confirm(`Deseja realmente ${acao} este cliente?`)) {
            return;
        }

        try {
            const resposta = await fetch(
                cliente.ativo
                    ? `${API}/clientes/${cliente.id}`
                    : `${API}/clientes/${cliente.id}/reativar`,
                {
                    method: cliente.ativo ? "DELETE" : "PATCH",
                    credentials: "include"
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(resultado.detail || `Erro ao ${acao} cliente.`);
            }

            setMensagem(resultado.mensagem || "Situação atualizada!");
            carregarClientes();
        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    const filtrados = clientes.filter(cliente =>
        `${cliente.nome} ${cliente.cpf} ${cliente.email}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    return (
        <main className="gestao-container">
            <header className="gestao-header">
                <div>
                    <h1>Clientes</h1>
                    <p>Gerencie os clientes cadastrados na oficina.</p>
                </div>

                <button className="gestao-btn-principal" onClick={abrirCadastro}>
                    + Novo cliente
                </button>
            </header>

            {mensagem && (
                <div className="gestao-mensagem">
                    {mensagem}
                    <button onClick={() => setMensagem("")}>×</button>
                </div>
            )}

            <section className="gestao-resumo">
                <div className="gestao-card">
                    <span>Total de clientes</span>
                    <strong>{clientes.length}</strong>
                </div>

                <div className="gestao-card">
                    <span>Ativos</span>
                    <strong>{clientes.filter(c => c.ativo).length}</strong>
                </div>

                <div className="gestao-card">
                    <span>Inativos</span>
                    <strong>{clientes.filter(c => !c.ativo).length}</strong>
                </div>
            </section>

            <section className="gestao-lista">
                <div className="gestao-lista-topo">
                    <h2>Lista de clientes</h2>

                    <input
                        type="search"
                        placeholder="Pesquisar por nome, CPF ou e-mail..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                </div>

                {carregando ? (
                    <p className="gestao-vazio">Carregando clientes...</p>
                ) : filtrados.length === 0 ? (
                    <p className="gestao-vazio">Nenhum cliente encontrado.</p>
                ) : (
                    <div className="gestao-tabela-wrapper">
                        <table className="gestao-tabela">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>E-mail</th>
                                    <th>Situação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtrados.map(cliente => (
                                    <tr key={cliente.id}>
                                        <td>#{cliente.id}</td>
                                        <td>{cliente.nome}</td>
                                        <td>{cliente.cpf}</td>
                                        <td>{cliente.email}</td>
                                        <td>
                                            <span className={
                                                cliente.ativo
                                                    ? "gestao-status ativo"
                                                    : "gestao-status inativo"
                                            }>
                                                {cliente.ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="gestao-acoes">
                                            <button
                                                className="gestao-btn-editar"
                                                onClick={() => abrirEdicao(cliente)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className={
                                                    cliente.ativo
                                                        ? "gestao-btn-inativar"
                                                        : "gestao-btn-reativar"
                                                }
                                                onClick={() => alterarSituacao(cliente)}
                                            >
                                                {cliente.ativo ? "Inativar" : "Reativar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {modal && (
                <div className="gestao-modal-fundo">
                    <div className="gestao-modal">
                        <div className="gestao-modal-topo">
                            <h2>{editando ? "Editar cliente" : "Novo cliente"}</h2>
                            <button onClick={() => setModal(false)}>×</button>
                        </div>

                        <form onSubmit={salvarCliente}>
                            <label>Nome completo</label>
                            <input
                                name="nome"
                                value={form.nome}
                                onChange={atualizarCampo}
                                required
                            />

                            <label>CPF</label>
                            <input
                                name="cpf"
                                value={form.cpf}
                                onChange={atualizarCampo}
                                placeholder="000.000.000-00"
                                required
                            />

                            <label>E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={atualizarCampo}
                                required
                            />

                            {!editando && (
                                <>
                                    <label>Senha</label>
                                    <input
                                        type="password"
                                        name="senha"
                                        value={form.senha}
                                        onChange={atualizarCampo}
                                        minLength={6}
                                        required
                                    />
                                </>
                            )}

                            <div className="gestao-modal-acoes">
                                <button
                                    type="button"
                                    className="gestao-btn-cancelar"
                                    onClick={() => setModal(false)}
                                >
                                    Cancelar
                                </button>

                                <button type="submit" className="gestao-btn-principal">
                                    {editando ? "Salvar alterações" : "Cadastrar cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}