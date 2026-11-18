import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function fazerLogin(e) {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const resposta = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.detail || "E-mail ou senha incorretos.");
            }

            const nivel = String(dados.nivel || dados.tipo || "").toLowerCase();

            if (nivel === "admin") {
                navigate("/");
            } else if (nivel === "funcionario") {
                navigate("/ordens-servico");
            } else if (nivel === "cliente") {
                navigate("/");
            } else {
                // Se o backend não retornar o nível, consulta a sessão.
                const respostaUsuario = await fetch("http://localhost:8000/me", {
                    credentials: "include"
                });

                if (!respostaUsuario.ok) {
                    throw new Error("Não foi possível identificar o perfil do usuário.");
                }

                const usuario = await respostaUsuario.json();
                const nivelUsuario = String(
                    usuario.nivel || usuario.tipo || ""
                ).toLowerCase();

                if (nivelUsuario === "funcionario") {
                    navigate("/ordens-servico");
                } else {
                    navigate("/");
                }
            }

        } catch (error) {
            setErro(error.message || "Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="login-page">
            <header className="login-navbar">
                <Link to="/" className="login-brand">
                    <span>Vibe</span>
                    <strong>Mechanics</strong>
                </Link>

                <Link to="/" className="login-back">
                    <i className="fa-solid fa-house"></i>
                    Voltar ao início
                </Link>
            </header>

            <main className="login-main">
                <div className="login-card">
                    <div className="login-card-header">
                        <div className="login-accent"></div>
                        <h1>Bem-vindo de volta!</h1>
                        <p>Entre na sua conta para acessar o sistema.</p>
                    </div>

                    <form onSubmit={fazerLogin}>
                        <div className="login-input-group">
                            <label htmlFor="email">E-mail</label>

                            <div className="login-input-wrapper">
                                <i className="fa-regular fa-envelope"></i>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Digite seu e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-input-group">
                            <label htmlFor="senha">Senha</label>

                            <div className="login-input-wrapper">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="senha"
                                    type={mostrarSenha ? "text" : "password"}
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-toggle-password"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    <i className={
                                        mostrarSenha
                                            ? "fa-regular fa-eye-slash"
                                            : "fa-regular fa-eye"
                                    }></i>
                                </button>
                            </div>
                        </div>

                        {erro && (
                            <div className="login-error">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {erro}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={carregando}
                        >
                            {carregando ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar no sistema
                                    <i className="fa-solid fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider"></div>

                    <div className="login-register">
                        <p>Ainda não possui uma conta?</p>
                        <Link to="/cadastro-clientes">
                            Cadastre-se aqui
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>

                <div className="login-footer">
                    <span>Vibe Mechanics</span>
                    <span>© 2026 - Sistema de Gestão de Oficina Mecânica</span>
                </div>
            </main>
        </div>
    );
}

export default Login;