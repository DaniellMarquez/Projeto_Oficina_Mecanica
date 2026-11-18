
import { useState } from "react";
import "./CadastroClientes.css";

const API = "http://localhost:8000";

function CadastroClientes() {
    const [form, setForm] = useState({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
    });

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    async function cadastrarCliente(e) {
        e.preventDefault();

        setMensagem("");
        setTipoMensagem("");
        setCarregando(true);

        try {
            const resposta = await fetch(`${API}/clientes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    nome: form.nome.trim(),
                    cpf: form.cpf.replace(/\D/g, ""),
                    email: form.email.trim(),
                    senha: form.senha,
                }),
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Não foi possível cadastrar o cliente."
                );
            }

            setMensagem("Cliente cadastrado com sucesso!");
            setTipoMensagem("sucesso");

            setForm({
                nome: "",
                cpf: "",
                email: "",
                senha: "",
            });

        } catch (erro) {
            setMensagem(
                erro.message || "Erro ao conectar com o servidor."
            );
            setTipoMensagem("erro");

        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="cadastro-container">
            <div className="cadastro-card">

                <div className="cadastro-header">
                    <div className="cadastro-icone">
                        <i className="fa-solid fa-user-plus"></i>
                    </div>

                    <h1>Cadastro de Clientes</h1>

                    <p>
                        Preencha os dados abaixo para cadastrar um novo cliente.
                    </p>
                </div>

                <form onSubmit={cadastrarCliente}>

                    <div className="campo">
                        <label htmlFor="nome">Nome completo</label>

                        <input
                            id="nome"
                            type="text"
                            name="nome"
                            placeholder="Digite o nome completo"
                            value={form.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="cpf">CPF</label>

                        <input
                            id="cpf"
                            type="text"
                            name="cpf"
                            placeholder="Digite somente os números ou o CPF formatado"
                            value={form.cpf}
                            onChange={handleChange}
                            maxLength={14}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="email">E-mail</label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="exemplo@email.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>

                        <input
                            id="senha"
                            type="password"
                            name="senha"
                            placeholder="Crie uma senha"
                            value={form.senha}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </div>

                    {mensagem && (
                        <div className={`mensagem ${tipoMensagem}`}>
                            {mensagem}
                        </div>
                    )}

                    <button type="submit" disabled={carregando}>
                        {carregando ? (
                            "Cadastrando..."
                        ) : (
                            <>
                                <i className="fa-solid fa-user-plus"></i>
                                {" "}Cadastrar Cliente
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default CadastroClientes;
