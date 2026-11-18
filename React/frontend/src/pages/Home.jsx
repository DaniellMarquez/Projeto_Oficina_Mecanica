
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
    const [sidebarAberto, setSidebarAberto] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);

    // Busca os dados do usuário logado
    useEffect(() => {
        async function buscarUsuario() {
            try {
                const resposta = await fetch("http://localhost:8000/me", {
                    credentials: "include"
                });

                if (!resposta.ok) {
                    setUsuario(null);
                    return;
                }

                const dados = await resposta.json();
                setUsuario(dados);

            } catch (erro) {
                console.error("Erro ao buscar usuário:", erro);
                setUsuario(null);
            } finally {
                setCarregandoUsuario(false);
            }
        }

        buscarUsuario();
    }, []);

    // Encerra a sessão
    const sair = async () => {
        try {
            await fetch("http://localhost:8000/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (erro) {
            console.error("Erro ao sair:", erro);
        } finally {
            window.location.href = "/login";
        }
    };

    const toggleSidebar = () => {
        setSidebarAberto(!sidebarAberto);
    };

    // Enquanto verifica o usuário
    if (carregandoUsuario) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-3">Carregando...</p>
                </div>
            </div>
        );
    }

    const nivelUsuario = String(
        usuario?.nivel || usuario?.tipo || ""
    ).toLowerCase();

    // =====================================================
    // PAINEL EXCLUSIVO DO ADMINISTRADOR
    // =====================================================

    if (usuario && nivelUsuario === "admin") {

        const modulos = [
            {
                titulo: "Clientes",
                descricao: "Cadastro e gerenciamento de clientes e contatos da oficina.",
                icone: "fa-users",
                rota: "/clientes"
            },
            {
                titulo: "Ordens de Serviço",
                descricao: "Controle de aberturas, andamentos e valores totais de OS.",
                icone: "fa-file-invoice-dollar",
                rota: "/ordens-servico"
            },
            {
                titulo: "Estoque",
                descricao: "Gerenciamento de peças, quantidades e preços de venda.",
                icone: "fa-boxes-stacked",
                rota: "/estoque"
            },
            {
                titulo: "Veículos",
                descricao: "Visualização e cadastro de automóveis vinculados aos clientes.",
                icone: "fa-car",
                rota: "/veiculos"
            },
            {
                titulo: "Funcionários",
                descricao: "Controle da equipe de mecânicos e operadores cadastrados.",
                icone: "fa-user-tie",
                rota: "/funcionarios"
            },
            {
                titulo: "Serviços",
                descricao: "Cadastro e gerenciamento dos serviços oferecidos pela oficina.",
                icone: "fa-screwdriver-wrench",
                rota: "/servicos"
            },
            {
                titulo: "Agendamentos",
                descricao: "Consulte e gerencie os agendamentos realizados pelos clientes.",
                icone: "fa-calendar-check",
                rota: "/agendamentos"
            }
        ];

        return (
            <div className="min-vh-100 bg-light">

                <nav
                    className="navbar px-4 py-3 shadow-sm"
                    style={{ backgroundColor: "#5381FF" }}
                >
                    <Link
                        to="/"
                        className="navbar-brand fw-bold fs-3 text-white text-decoration-none"
                    >
                        Vibe<span style={{ color: "#F97316" }}>Mechanics</span>
                    </Link>

                    <div className="d-flex align-items-center gap-3">

                        <div className="text-white text-end">
                            <div className="fw-bold">
                                Olá, {usuario.nome || usuario.name || "Administrador"}
                            </div>
                            <small>Admin</small>
                        </div>

                        <button
                            className="btn btn-outline-light btn-sm fw-semibold"
                            onClick={sair}
                            type="button"
                        >
                            <i className="fa-solid fa-right-from-bracket me-2"></i>
                            Sair
                        </button>

                    </div>
                </nav>

                <main className="container py-5">

                    <div className="mb-4">
                        <h2 className="fw-bold" style={{ color: "#323232" }}>
                            Gerenciamento do Sistema
                        </h2>

                        <p className="text-muted">
                            Selecione abaixo o módulo que deseja gerenciar ou cadastrar.
                        </p>
                    </div>

                    <div className="row g-4">

                        {modulos.map((modulo) => (
                            <div
                                className="col-md-6 col-lg-4"
                                key={modulo.titulo}
                            >
                                <Link
                                    to={modulo.rota}
                                    className="text-decoration-none"
                                >
                                    <div
                                        className="card h-100 border-0 shadow-sm p-4"
                                        style={{
                                            borderRadius: "12px",
                                            borderTop: "4px solid #F97316",
                                            transition: "transform 0.2s, box-shadow 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-4px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "";
                                        }}
                                    >

                                        <div className="d-flex align-items-center gap-3 mb-3">

                                            <div
                                                className="d-flex align-items-center justify-content-center rounded"
                                                style={{
                                                    width: "52px",
                                                    height: "52px",
                                                    backgroundColor: "#5381FF",
                                                    color: "#fff",
                                                    fontSize: "22px",
                                                    flexShrink: 0
                                                }}
                                            >
                                                <i className={`fa-solid ${modulo.icone}`}></i>
                                            </div>

                                            <h5 className="fw-bold mb-0 text-dark">
                                                {modulo.titulo}
                                            </h5>

                                        </div>

                                        <p className="text-muted mb-3">
                                            {modulo.descricao}
                                        </p>

                                        <div
                                            className="fw-semibold"
                                            style={{ color: "#F97316" }}
                                        >
                                            Acessar módulo
                                            <i className="fa-solid fa-arrow-right ms-2"></i>
                                        </div>

                                    </div>
                                </Link>
                            </div>
                        ))}

                    </div>

                </main>

                <footer
                    className="text-center text-white py-3 mt-5"
                    style={{ backgroundColor: "#5381FF" }}
                >
                    <p className="mb-0">
                        © 2026 - Vibe Mechanics | Painel Administrativo
                    </p>
                </footer>

            </div>
        );
    }

    // =====================================================
    // PAINEL EXCLUSIVO DO FUNCIONÁRIO
    // =====================================================

    if (usuario && nivelUsuario === "funcionario") {

        return (
            <div className="min-vh-100 bg-light">

                <nav
                    className="navbar px-4 py-3 shadow-sm"
                    style={{ backgroundColor: "#5381FF" }}
                >
                    <Link
                        to="/"
                        className="navbar-brand fw-bold fs-3 text-white text-decoration-none"
                    >
                        Vibe<span style={{ color: "#F97316" }}>Mechanics</span>
                    </Link>

                    <div className="d-flex align-items-center gap-3">

                        <div className="text-white text-end">
                            <div className="fw-bold">
                                Olá, {usuario.nome || usuario.name || "Funcionário"}
                            </div>
                            <small>Funcionário</small>
                        </div>

                        <button
                            className="btn btn-outline-light btn-sm fw-semibold"
                            onClick={sair}
                            type="button"
                        >
                            <i className="fa-solid fa-right-from-bracket me-2"></i>
                            Sair
                        </button>

                    </div>
                </nav>

                <main className="container py-5">

                    <div className="mb-5">
                        <h2 className="fw-bold" style={{ color: "#323232" }}>
                            Painel do Funcionário
                        </h2>

                        <p className="text-muted">
                            Bem-vindo ao VibeMechanics! Acesse as ferramentas
                            necessárias para realizar seu trabalho.
                        </p>
                    </div>

                    <div className="row g-4">

                        <div className="col-md-6 col-lg-4">

                            <Link
                                to="/ordens-servico"
                                className="text-decoration-none"
                            >
                                <div
                                    className="card h-100 border-0 shadow-sm p-4"
                                    style={{
                                        borderRadius: "12px",
                                        borderTop: "4px solid #F97316",
                                        transition: "transform 0.2s, box-shadow 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "";
                                    }}
                                >

                                    <div className="d-flex align-items-center gap-3 mb-3">

                                        <div
                                            className="d-flex align-items-center justify-content-center rounded"
                                            style={{
                                                width: "55px",
                                                height: "55px",
                                                backgroundColor: "#5381FF",
                                                color: "#fff",
                                                fontSize: "23px"
                                            }}
                                        >
                                            <i className="fa-solid fa-file-invoice-dollar"></i>
                                        </div>

                                        <h5 className="fw-bold mb-0 text-dark">
                                            Ordens de Serviço
                                        </h5>

                                    </div>

                                    <p className="text-muted mb-3">
                                        Consulte, cadastre e acompanhe as ordens
                                        de serviço da oficina.
                                    </p>

                                    <div
                                        className="fw-semibold"
                                        style={{ color: "#F97316" }}
                                    >
                                        Acessar ordens
                                        <i className="fa-solid fa-arrow-right ms-2"></i>
                                    </div>

                                </div>
                            </Link>

                        </div>

                    </div>

                </main>

                <footer
                    className="text-center text-white py-3 mt-5"
                    style={{ backgroundColor: "#5381FF" }}
                >
                    <p className="mb-0">
                        © 2026 - Vibe Mechanics | Painel do Funcionário
                    </p>
                </footer>

            </div>
        );
    }

    // =====================================================
    // PÁGINA INICIAL DO CLIENTE E VISITANTE
    // =====================================================

    return (

        <div className="w-100 min-vh-100 bg-white m-0 p-0 position-relative overflow-x-hidden">

            {/* BARRA DE NAVEGAÇÃO */}
            <nav className="navbar navbar-expand-lg fixed-top shadow-sm py-1 inline-style-1 z-navbar">

                <div className="container-fluid px-4">

                    <div className="row w-100 align-items-center m-0">

                        {/* BOTÃO MENU */}
                        <div className="col-4 d-flex align-items-center">

                            <button
                                className="btn text-white p-0 fs-4 border-0 shadow-none d-flex align-items-center cursor-pointer"
                                onClick={toggleSidebar}
                                type="button"
                            >
                                <i className="fa-solid fa-bars text-white"></i>
                            </button>

                        </div>

                        {/* LOGO */}
                        <div className="col-4 text-center">

                            <Link
                                className="navbar-brand fw-bold fs-3 text-decoration-none m-0"
                                to="/"
                            >
                                <span className="inline-style-2">Vibe</span>
                                <span className="inline-style-3">Mechanics</span>
                            </Link>

                        </div>

                        {/* USUÁRIO */}
                        <div className="col-4 d-flex justify-content-end align-items-center gap-2">

                            {usuario ? (

                                <div className="d-flex align-items-center justify-content-end gap-3">

                                    <div className="text-white text-end">

                                        <div className="fw-bold">
                                            <i className="fa-solid fa-user-circle me-2"></i>
                                            Olá, {usuario.nome || usuario.name || "Usuário"}!
                                        </div>

                                        <small className="text-white-50">
                                            {usuario.nivel || usuario.tipo || "Usuário"}
                                        </small>

                                    </div>

                                    <button
                                        className="btn btn-outline-light btn-sm fw-semibold"
                                        onClick={sair}
                                        type="button"
                                    >
                                        <i className="fa-solid fa-right-from-bracket me-2"></i>
                                        Sair
                                    </button>

                                </div>

                            ) : (

                                <>
                                    <Link
                                        className="btn btn-light px-3 py-1 fw-semibold text-primary shadow-sm"
                                        to="/login"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        className="btn btn-outline-light px-3 py-1 fw-semibold shadow-sm"
                                        to="/cadastro-clientes"
                                    >
                                        Cadastro
                                    </Link>
                                </>

                            )}

                        </div>

                    </div>

                </div>

            </nav>

            {/* OVERLAY DA SIDEBAR */}
            {sidebarAberto && (
                <div
                    onClick={toggleSidebar}
                    style={{
                        position: "fixed",
                        top: "56px",
                        left: 0,
                        width: "100vw",
                        height: "calc(100vh - 56px)",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        zIndex: 1045
                    }}
                />
            )}

            {/* MENU LATERAL */}
            <div
                className="shadow-lg p-3 bg-white"
                style={{
                    position: "fixed",
                    top: "56px",
                    left: sidebarAberto ? "0px" : "-320px",
                    width: "320px",
                    height: "calc(100vh - 56px)",
                    transition: "left 0.3s ease-in-out",
                    zIndex: 1050,
                    overflowY: "auto"
                }}
            >

                <div className="d-flex flex-column gap-3 mt-2">

                    <div className="d-flex justify-content-between align-items-center">

                        <h5 className="fw-bold m-0 section-title">
                            Menu de Navegação
                        </h5>

                        <button
                            className="btn btn-sm text-muted border-0"
                            onClick={toggleSidebar}
                            type="button"
                        >
                            <i className="fa-solid fa-xmark fa-lg"></i>
                        </button>

                    </div>

                    {!usuario && (
                        <>
                            <Link
                                to="/login"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-arrow-right-to-bracket fa-lg"></i>

                                    <div>
                                        <span className="fw-bold d-block text-dark">
                                            Entrar
                                        </span>
                                        <small className="text-muted">
                                            Acesse sua conta.
                                        </small>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                to="/cadastro-clientes"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-user-plus fa-lg"></i>

                                    <div>
                                        <span className="fw-bold d-block text-dark">
                                            Criar conta
                                        </span>
                                        <small className="text-muted">
                                            Cadastre-se como cliente.
                                        </small>
                                    </div>
                                </div>
                            </Link>

                            <hr className="my-2" />
                        </>
                    )}

                    <Link
                        to="/"
                        className="sidebar-card"
                        onClick={toggleSidebar}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <i className="fa-solid fa-house fa-lg"></i>
                            <span className="fw-semibold">Início</span>
                        </div>
                    </Link>

                    {usuario && (
                        <>
                            <Link
                                to="/veiculos"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-car fa-lg"></i>
                                    <span className="fw-semibold">Minha garagem</span>
                                </div>
                            </Link>

                            <Link
                                to="/historico-servicos"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
                                    <span className="fw-semibold">Histórico de serviços</span>
                                </div>
                            </Link>

                            <Link
                                to="/agendamento"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-calendar-check fa-lg"></i>
                                    <span className="fw-semibold">Agendar atendimento</span>
                                </div>
                            </Link>
                        </>
                    )}

                    {!usuario && (
                        <>
                            <Link
                                to="/clientes"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-users fa-lg"></i>
                                    <span className="fw-semibold">Clientes</span>
                                </div>
                            </Link>

                            <Link
                                to="/veiculos"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-car fa-lg"></i>
                                    <span className="fw-semibold">Veículos</span>
                                </div>
                            </Link>

                            <Link
                                to="/ordens-servico"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-file-invoice-dollar fa-lg"></i>
                                    <span className="fw-semibold">Ordens de Serviço</span>
                                </div>
                            </Link>

                            <Link
                                to="/estoque"
                                className="sidebar-card"
                                onClick={toggleSidebar}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-boxes-stacked fa-lg"></i>
                                    <span className="fw-semibold">Estoque</span>
                                </div>
                            </Link>
                        </>
                    )}

                </div>

            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <main style={{ marginTop: "56px" }}>

                {/* IMAGEM PRINCIPAL */}
                <div className="container-fluid p-0 hero-section m-0">

                    <img
                        alt="Vibe Mechanics"
                        className="w-100 object-fit-cover"
                        src="/assets/fotoInicial.svg"
                        style={{ maxHeight: "450px" }}
                    />

                </div>

                {/* ESTATÍSTICAS */}
                <section className="container-fluid text-white py-3 px-4 inline-style-4">

                    <div className="row text-center justify-content-around align-items-center">

                        <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 my-2">
                            <i className="fa-solid fa-users fa-2x"></i>
                            <span className="fs-5 fw-bold">
                                +1.500 Usuários Atendidos
                            </span>
                        </div>

                        <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 my-2">
                            <i className="fa-solid fa-wrench fa-2x"></i>
                            <span className="fs-5 fw-bold">
                                10 Anos de Experiência
                            </span>
                        </div>

                        <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 my-2">
                            <i className="fa-solid fa-heart fa-2x"></i>
                            <span className="fs-5 fw-bold">
                                98% Satisfação dos Clientes
                            </span>
                        </div>

                    </div>

                </section>

                {/* SEÇÃO DE AGENDAMENTO */}
                <section className="container my-5">

                    <div className="text-white text-center py-2 rounded-top fw-bold fs-4 shadow-sm inline-style-10">
                        Agendamento
                    </div>

                    <div className="bg-white p-4 rounded-bottom shadow-sm border border-top-0">

                        <div className="row g-4 align-items-stretch">

                            <div className="col-lg-6 d-flex flex-column gap-4">

                                {/* PROFISSIONAIS */}
                                <div className="card card-custom flex-grow-1 p-3 border-0 shadow-sm inline-style-18">

                                    <div className="d-flex align-items-center h-100">

                                        <div className="me-3 bg-light rounded overflow-hidden flex-shrink-0 image-box-80">
                                            <img
                                                alt="Profissionais"
                                                className="w-100 h-100 object-fit-cover"
                                                src="/assets/profissionaisCard.svg"
                                            />
                                        </div>

                                        <div>
                                            <h5 className="fw-bold mb-1">
                                                Profissionais
                                            </h5>

                                            <p className="text-muted small m-0">
                                                Conheça nossos critérios de seleção e seriedade empresarial.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* SERVIÇOS */}
                                <div className="card card-custom flex-grow-1 p-3 border-0 shadow-sm inline-style-18">

                                    <div className="d-flex align-items-center h-100">

                                        <div className="me-3 bg-light rounded overflow-hidden flex-shrink-0 image-box-80">
                                            <img
                                                alt="Serviços"
                                                className="w-100 h-100 object-fit-cover"
                                                src="/assets/servicosCard.svg"
                                            />
                                        </div>

                                        <div>
                                            <h5 className="fw-bold mb-1">
                                                Serviços
                                            </h5>

                                            <p className="text-muted small m-0">
                                                Explore a lista completa de serviços cobertos pela nossa oficina.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* AGENDAMENTO */}
                            <div className="col-lg-6">

                                <div className="card card-custom h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-between inline-style-20">

                                    <div>

                                        <div className="mb-3 overflow-hidden rounded inline-style-21">

                                            <img
                                                alt="Agendamento"
                                                className="w-100 h-100 object-fit-cover"
                                                src="/assets/agendamentoCard.svg"
                                            />

                                        </div>

                                        <h4 className="fw-bold">
                                            Faça sua Avaliação e Agendamento
                                        </h4>

                                        <p className="text-muted">
                                            Garanta o melhor atendimento para o seu veículo de forma rápida e segura com profissionais qualificados.
                                        </p>

                                    </div>

                                    <Link
                                        to={usuario ? "/agendamento" : "/login"}
                                        className="btn text-white fw-bold py-2 mt-3 border-0 inline-style-4 text-decoration-none text-center"
                                    >
                                        Agendar Agora
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

            {/* RODAPÉ */}
            <footer className="mt-5 w-100">

                <div className="container-fluid text-white py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center inline-style-10">

                    <div className="fw-semibold mb-2 mb-md-0">
                        Contate-nos através de nossas redes oficiais!
                    </div>

                    <div className="d-flex gap-3 fs-5">

                        <a className="text-white" href="#">
                            <i className="fa-brands fa-facebook"></i>
                        </a>

                        <a className="text-white" href="#">
                            <i className="fa-brands fa-instagram"></i>
                        </a>

                        <a className="text-white" href="#">
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>

                        <a className="text-white" href="#">
                            <i className="fa-solid fa-envelope me-2"></i>
                        </a>

                    </div>

                </div>

                <div className="container-fluid text-white py-4 px-4 inline-style-4">

                    <div className="row text-center text-md-start">

                        <div className="col-md-4 mb-3 mb-md-0">

                            <h5 className="fw-bold mb-3">
                                Sobre nós
                            </h5>

                            <p className="small text-light">
                                Sistema moderno e integrado para gestão de oficinas mecânicas com agilidade e eficiência.
                            </p>

                        </div>

                        <div className="col-md-4 mb-3 mb-md-0">

                            <h5 className="fw-bold mb-3">
                                Links úteis
                            </h5>

                            <p className="small text-light">
                                Consulte nossos termos de serviço, políticas de privacidade e suporte técnico.
                            </p>

                        </div>

                        <div className="col-md-4">

                            <h5 className="fw-bold mb-3">
                                Contato
                            </h5>

                            <ul className="list-unstyled small d-flex flex-column gap-2">

                                <li>
                                    <i className="fa-solid fa-house me-2"></i>
                                    Localização: Rua dos Bobos, 0 - Lugar nenhum
                                </li>

                                <li>
                                    <i className="fa-brands fa-whatsapp me-2"></i>
                                    Whatsapp: (11) 99999-9999
                                </li>

                                <li>
                                    <i className="fa-solid fa-envelope me-2"></i>
                                    E-mail: contato@vibemechanics.com
                                </li>

                            </ul>

                        </div>

                    </div>

                </div>

            </footer>

        </div>
    );
}
