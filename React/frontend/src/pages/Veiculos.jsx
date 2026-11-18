
import { useEffect, useMemo, useState } from "react";
import "./Gestao.css";

const API = "http://localhost:8000";

const formularioInicial = {
    placa: "",
    marca: "",
    modelo: "",
    ano: "",
    cliente_id: ""
};

export default function Veiculos() {
    const [usuario, setUsuario] = useState(null);
    const [veiculos, setVeiculos] = useState([]);
    const [busca, setBusca] = useState("");
    const [form, setForm] = useState(formularioInicial);
    const [editando, setEditando] = useState(null);
    const [modal, setModal] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    const podeGerenciar =
        usuario?.nivel === "admin" ||
        usuario?.nivel === "funcionario";

    async function carregarDados() {
        setCarregando(true);

        try {
            // Busca o usuário logado
            const respostaUsuario = await fetch(`${API}/me`, {
                credentials: "include"
            });

            if (!respostaUsuario.ok) {
                throw new Error("Faça login para acessar os veículos.");
            }

            const dadosUsuario = await respostaUsuario.json();
            setUsuario(dadosUsuario);

            // Administrador e funcionário veem todos os veículos.
            // Cliente vê somente os próprios.
            const url = dadosUsuario.nivel === "cliente"
                ? `${API}/clientes/${dadosUsuario.id}/veiculos`
                : `${API}/veiculos`;

            const resposta = await fetch(url, {
                credentials: "include"
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os veículos.");
            }

            const dados = await resposta.json();
            setVeiculos(dados);

        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    function abrirCadastro() {
        setEditando(null);

        setForm({
            ...formularioInicial,
            cliente_id: usuario?.nivel === "cliente"
                ? String(usuario.id)
                : ""
        });

        setModal(true);
    }

    function abrirEdicao(veiculo) {
        setEditando(veiculo);

        setForm({
            placa: veiculo.placa || "",
            marca: veiculo.marca || "",
            modelo: veiculo.modelo || "",
            ano: veiculo.ano || "",
            cliente_id: String(veiculo.cliente_id || "")
        });

        setModal(true);
    }

    function atualizarCampo(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function salvarVeiculo(e) {
        e.preventDefault();
        setMensagem("");

        const dados = {
            placa: form.placa.trim().toUpperCase(),
            marca: form.marca.trim(),
            modelo: form.modelo.trim(),
            ano: Number(form.ano),
            cliente_id: Number(
                usuario?.nivel === "cliente"
                    ? usuario.id
                    : form.cliente_id
            )
        };

        if (!dados.cliente_id) {
            setMensagem("Informe o ID do cliente.");
            return;
        }

        const url = editando
            ? `${API}/veiculos/${editando.id}`
            : `${API}/veiculos`;

        try {
            const resposta = await fetch(url, {
                method: editando ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail || "Não foi possível salvar o veículo."
                );
            }

            setMensagem(
                editando
                    ? "Veículo atualizado com sucesso!"
                    : "Veículo cadastrado com sucesso!"
            );

            setModal(false);
            setForm(formularioInicial);
            setEditando(null);

            await carregarDados();

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    async function excluirVeiculo(veiculo) {
        const confirmar = window.confirm(
            `Deseja realmente excluir o veículo ${veiculo.modelo} - ${veiculo.placa}?`
        );

        if (!confirmar) return;

        try {
            const resposta = await fetch(
                `${API}/veiculos/${veiculo.id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail || "Não foi possível excluir o veículo."
                );
            }

            setMensagem("Veículo excluído com sucesso!");
            await carregarDados();

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    const veiculosFiltrados = useMemo(() => {
        const termo = busca.toLowerCase();

        return veiculos.filter((veiculo) =>
            [
                veiculo.placa,
                veiculo.marca,
                veiculo.modelo,
                veiculo.ano,
                veiculo.cliente_nome
            ]
                .join(" ")
                .toLowerCase()
                .includes(termo)
        );
    }, [veiculos, busca]);

    return (
        <main className="gestao-container">

            <header className="gestao-header">
                <div>
                    <h1>Veículos cadastrados</h1>
                    <p>Consulte e gerencie os veículos da oficina.</p>
                </div>

                <button
                    className="gestao-btn-principal"
                    onClick={abrirCadastro}
                >
                    + Cadastrar veículo
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
                    <span>Total de veículos</span>
                    <strong>{veiculos.length}</strong>
                </div>

                <div className="gestao-card">
                    <span>Marcas cadastradas</span>
                    <strong>
                        {new Set(veiculos.map(v => v.marca)).size}
                    </strong>
                </div>

                <div className="gestao-card">
                    <span>Modelos cadastrados</span>
                    <strong>
                        {new Set(veiculos.map(v => v.modelo)).size}
                    </strong>
                </div>
            </section>

            <section className="gestao-lista">
                <div className="gestao-lista-topo">
                    <h2>Lista de veículos</h2>

                    <input
                        type="search"
                        placeholder="Pesquisar placa, marca, modelo ou cliente..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                {carregando ? (
                    <p className="gestao-vazio">
                        Carregando veículos...
                    </p>
                ) : veiculosFiltrados.length === 0 ? (
                    <p className="gestao-vazio">
                        Nenhum veículo encontrado.
                    </p>
                ) : (
                    <div className="gestao-tabela-wrapper">
                        <table className="gestao-tabela">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Placa</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Ano</th>
                                    <th>Cliente</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {veiculosFiltrados.map((veiculo) => (
                                    <tr key={veiculo.id}>
                                        <td>#{veiculo.id}</td>

                                        <td>
                                            <strong>{veiculo.placa}</strong>
                                        </td>

                                        <td>{veiculo.marca}</td>
                                        <td>{veiculo.modelo}</td>
                                        <td>{veiculo.ano}</td>

                                        <td>
                                            {veiculo.cliente_nome || `Cliente #${veiculo.cliente_id}`}
                                        </td>

                                        <td className="gestao-acoes">
                                            <button
                                                className="gestao-btn-editar"
                                                onClick={() => abrirEdicao(veiculo)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className="gestao-btn-inativar"
                                                onClick={() => excluirVeiculo(veiculo)}
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
            </section>

            {modal && (
                <div className="gestao-modal-fundo">
                    <div className="gestao-modal">

                        <div className="gestao-modal-topo">
                            <h2>
                                {editando
                                    ? "Editar veículo"
                                    : "Cadastrar veículo"}
                            </h2>

                            <button onClick={() => setModal(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarVeiculo}>
                            <label>Placa</label>
                            <input
                                name="placa"
                                value={form.placa}
                                onChange={atualizarCampo}
                                placeholder="ABC1D23"
                                maxLength={7}
                                required
                            />

                            <label>Marca</label>
                            <input
                                name="marca"
                                value={form.marca}
                                onChange={atualizarCampo}
                                placeholder="Ex: Toyota"
                                required
                            />

                            <label>Modelo</label>
                            <input
                                name="modelo"
                                value={form.modelo}
                                onChange={atualizarCampo}
                                placeholder="Ex: Corolla"
                                required
                            />

                            <label>Ano</label>
                            <input
                                type="number"
                                name="ano"
                                value={form.ano}
                                onChange={atualizarCampo}
                                placeholder="Ex: 2022"
                                min="1900"
                                max="2100"
                                required
                            />

                            {usuario?.nivel !== "cliente" && (
                                <>
                                    <label>ID do cliente</label>
                                    <input
                                        type="number"
                                        name="cliente_id"
                                        value={form.cliente_id}
                                        onChange={atualizarCampo}
                                        placeholder="Digite o ID do cliente"
                                        min="1"
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

                                <button
                                    type="submit"
                                    className="gestao-btn-principal"
                                >
                                    {editando
                                        ? "Salvar alterações"
                                        : "Cadastrar veículo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </main>
    );
}
