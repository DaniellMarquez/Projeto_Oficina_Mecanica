import { useEffect, useState } from "react";
import "./Gestao.css";

const API = "http://localhost:8000";

export default function Estoque() {
    const [pecas, setPecas] = useState([]);
    const [busca, setBusca] = useState("");
    const [modal, setModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    const formularioInicial = {
        nome: "",
        marca: "",
        fabricante: "",
        preco_compra: "",
        preco_venda: "",
        quantidade_estoque: ""
    };

    const [form, setForm] = useState(formularioInicial);

    async function carregarEstoque() {
        try {
            const resposta = await fetch(`${API}/estoque`, {
                credentials: "include"
            });

            if (!resposta.ok) {
                throw new Error(
                    resposta.status === 403
                        ? "Você não tem permissão para acessar o estoque."
                        : "Erro ao carregar o estoque."
                );
            }

            setPecas(await resposta.json());
        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarEstoque();
    }, []);

    function abrirCadastro() {
        setEditando(null);
        setForm(formularioInicial);
        setModal(true);
    }

    function abrirEdicao(peca) {
        setEditando(peca);
        setForm({
            nome: peca.nome || "",
            marca: peca.marca || "",
            fabricante: peca.fabricante || "",
            preco_compra: peca.preco_compra,
            preco_venda: peca.preco_venda,
            quantidade_estoque: peca.quantidade_estoque
        });
        setModal(true);
    }

    function atualizarCampo(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function salvarPeca(e) {
        e.preventDefault();
        setMensagem("");

        const dados = {
            nome: form.nome,
            marca: form.marca,
            fabricante: form.fabricante,
            preco_compra: Number(form.preco_compra),
            preco_venda: Number(form.preco_venda),
            quantidade_estoque: Number(form.quantidade_estoque)
        };

        try {
            const resposta = await fetch(
                editando
                    ? `${API}/estoque/${editando.id}`
                    : `${API}/estoque`,
                {
                    method: editando ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(dados)
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(resultado.detail || "Erro ao salvar peça.");
            }

            setMensagem(
                editando
                    ? "Peça atualizada com sucesso!"
                    : "Peça cadastrada com sucesso!"
            );

            setModal(false);
            setForm(formularioInicial);
            carregarEstoque();
        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    async function alterarSituacao(peca) {
        const acao = peca.ativo ? "inativar" : "reativar";

        if (!window.confirm(`Deseja realmente ${acao} esta peça?`)) {
            return;
        }

        try {
            const resposta = await fetch(
                peca.ativo
                    ? `${API}/estoque/${peca.id}`
                    : `${API}/estoque/${peca.id}/reativar`,
                {
                    method: peca.ativo ? "DELETE" : "PATCH",
                    credentials: "include"
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(resultado.detail || `Erro ao ${acao} peça.`);
            }

            setMensagem(resultado.mensagem || "Situação atualizada!");
            carregarEstoque();
        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    const filtradas = pecas.filter(peca =>
        `${peca.nome} ${peca.marca || ""} ${peca.fabricante || ""}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    const ativos = pecas.filter(p => p.ativo);
    const valorEstoque = ativos.reduce(
        (total, peca) =>
            total + Number(peca.preco_compra) * Number(peca.quantidade_estoque),
        0
    );

    const formatarMoeda = valor =>
        Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    return (
        <main className="gestao-container">
            <header className="gestao-header">
                <div>
                    <h1>Estoque de peças</h1>
                    <p>Gerencie as peças e os produtos da oficina.</p>
                </div>

                <button className="gestao-btn-principal" onClick={abrirCadastro}>
                    + Nova peça
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
                    <span>Peças cadastradas</span>
                    <strong>{pecas.length}</strong>
                </div>

                <div className="gestao-card">
                    <span>Peças ativas</span>
                    <strong>{ativos.length}</strong>
                </div>

                <div className="gestao-card">
                    <span>Valor de custo em estoque</span>
                    <strong>{formatarMoeda(valorEstoque)}</strong>
                </div>
            </section>

            <section className="gestao-lista">
                <div className="gestao-lista-topo">
                    <h2>Lista de peças</h2>

                    <input
                        type="search"
                        placeholder="Pesquisar peça, marca ou fabricante..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                </div>

                {carregando ? (
                    <p className="gestao-vazio">Carregando estoque...</p>
                ) : filtradas.length === 0 ? (
                    <p className="gestao-vazio">Nenhuma peça encontrada.</p>
                ) : (
                    <div className="gestao-tabela-wrapper">
                        <table className="gestao-tabela">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Peça</th>
                                    <th>Marca</th>
                                    <th>Fabricante</th>
                                    <th>Preço de compra</th>
                                    <th>Preço de venda</th>
                                    <th>Quantidade</th>
                                    <th>Situação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtradas.map(peca => (
                                    <tr key={peca.id}>
                                        <td>#{peca.id}</td>
                                        <td>{peca.nome}</td>
                                        <td>{peca.marca || "-"}</td>
                                        <td>{peca.fabricante || "-"}</td>
                                        <td>{formatarMoeda(peca.preco_compra)}</td>
                                        <td>{formatarMoeda(peca.preco_venda)}</td>
                                        <td>
                                            <strong className={
                                                Number(peca.quantidade_estoque) <= 5
                                                    ? "gestao-estoque-baixo"
                                                    : ""
                                            }>
                                                {peca.quantidade_estoque}
                                            </strong>
                                        </td>
                                        <td>
                                            <span className={
                                                peca.ativo
                                                    ? "gestao-status ativo"
                                                    : "gestao-status inativo"
                                            }>
                                                {peca.ativo ? "Ativa" : "Inativa"}
                                            </span>
                                        </td>
                                        <td className="gestao-acoes">
                                            <button
                                                className="gestao-btn-editar"
                                                onClick={() => abrirEdicao(peca)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className={
                                                    peca.ativo
                                                        ? "gestao-btn-inativar"
                                                        : "gestao-btn-reativar"
                                                }
                                                onClick={() => alterarSituacao(peca)}
                                            >
                                                {peca.ativo ? "Inativar" : "Reativar"}
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
                            <h2>{editando ? "Editar peça" : "Cadastrar peça"}</h2>
                            <button onClick={() => setModal(false)}>×</button>
                        </div>

                        <form onSubmit={salvarPeca}>
                            <label>Nome da peça</label>
                            <input
                                name="nome"
                                value={form.nome}
                                onChange={atualizarCampo}
                                required
                            />

                            <label>Marca</label>
                            <input
                                name="marca"
                                value={form.marca}
                                onChange={atualizarCampo}
                            />

                            <label>Fabricante</label>
                            <input
                                name="fabricante"
                                value={form.fabricante}
                                onChange={atualizarCampo}
                            />

                            <div className="gestao-campos-duplos">
                                <div>
                                    <label>Preço de compra (R$)</label>
                                    <input
                                        type="number"
                                        name="preco_compra"
                                        min="0"
                                        step="0.01"
                                        value={form.preco_compra}
                                        onChange={atualizarCampo}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Preço de venda (R$)</label>
                                    <input
                                        type="number"
                                        name="preco_venda"
                                        min="0"
                                        step="0.01"
                                        value={form.preco_venda}
                                        onChange={atualizarCampo}
                                        required
                                    />
                                </div>
                            </div>

                            <label>Quantidade em estoque</label>
                            <input
                                type="number"
                                name="quantidade_estoque"
                                min="0"
                                step="1"
                                value={form.quantidade_estoque}
                                onChange={atualizarCampo}
                                required
                            />

                            <div className="gestao-modal-acoes">
                                <button
                                    type="button"
                                    className="gestao-btn-cancelar"
                                    onClick={() => setModal(false)}
                                >
                                    Cancelar
                                </button>

                                <button type="submit" className="gestao-btn-principal">
                                    {editando ? "Salvar alterações" : "Cadastrar peça"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}