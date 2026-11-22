import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [sidebarAberto, setSidebarAberto] = useState(false);

  async function sair() {
    await logout();
    navigate("/login");
  }

  function agendarAgora() {
    if (!usuario) {
      navigate("/login");
      return;
    }
    if (usuario.nivel === "cliente") {
      navigate("/agendamento");
      return;
    }
    alert("O agendamento pelo portal é destinado a clientes.");
  }

  function cardMenu(to, icone, titulo, texto) {
    return (
      <Link to={to} className="sidebar-card" onClick={() => setSidebarAberto(false)}>
        <div className="d-flex align-items-start gap-3">
          <i className={`fa-solid ${icone} fs-4 mt-1`}></i>
          <div>
            <div className="fw-bold">{titulo}</div>
            <div className="small text-muted">{texto}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="w-100 position-relative overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="navbar fixed-top shadow-sm py-1 bg-brand-blue z-navbar">
        <div className="container-fluid px-4">
          <div className="row w-100 align-items-center m-0">
            <div className="col-4">
              <button
                type="button"
                className="btn text-white p-0 fs-4 border-0"
                onClick={() => setSidebarAberto((s) => !s)}
              >
                <i className="fa-solid fa-bars text-white"></i>
              </button>
            </div>
            <div className="col-4 text-center">
              <Link className="navbar-brand fw-bold fs-3 m-0" to="/">
                <span className="brand-light">Vibe</span>
                <span className="brand-dark">Mechanics</span>
              </Link>
            </div>
            <div className="col-4 d-flex justify-content-end gap-2 align-items-center">
              {usuario ? (
                <>
                  <span className="text-white fw-semibold small text-truncate user-name-limit">
                    <i className="fa-solid fa-user me-1"></i>
                    {usuario.nome}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm fw-semibold"
                    onClick={sair}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-light px-3 py-1 fw-semibold text-primary" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-outline-light px-3 py-1 fw-semibold" to="/cadastro-cliente">
                    Cadastro
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className={`position-fixed shadow-lg p-3 bg-white sidebar-lateral ${sidebarAberto ? "aberta" : ""}`}>
        <div className="d-flex flex-column gap-3 mt-2">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-3 section-title">Menu de Navegação</h5>
            <button
              type="button"
              className="btn btn-sm border-0 text-muted"
              onClick={() => setSidebarAberto(false)}
            >
              <i className="fa-solid fa-xmark fa-lg"></i>
            </button>
          </div>

          {!usuario && (
            <>
              {cardMenu("/login", "fa-right-to-bracket", "Entrar", "Acesse sua conta.")}
              {cardMenu("/cadastro-cliente", "fa-user-plus", "Criar conta", "Cadastre-se como cliente.")}
              <hr className="my-2" />
            </>
          )}

          {cardMenu("/", "fa-house", "Início", "Volte à página inicial.")}

          {usuario && usuario.nivel === "cliente" && (
            <>
              {cardMenu("/garagem", "fa-car", "Minha garagem", "Cadastre e gerencie seus veículos.")}
              {cardMenu("/historico-servicos", "fa-clock-rotate-left", "Histórico de serviços", "Consulte serviços em andamento e concluídos.")}
              {cardMenu("/agendamento", "fa-calendar-check", "Agendar atendimento", "Escolha um veículo e uma data para atendimento.")}
            </>
          )}

          {usuario && usuario.nivel === "admin" && (
            cardMenu("/painel-admin", "fa-screwdriver-wrench", "Painel administrativo", "Acesse o gerenciamento da oficina.")
          )}

          {usuario && usuario.nivel === "funcionario" && (
            cardMenu("/painel-ordens", "fa-clipboard-list", "Ordens de serviço", "Acompanhe as operações da oficina.")
          )}
        </div>
      </div>

      {/* CONTEÚDO */}
      <main className="page-top-spacing">
        <div className="container-fluid p-0">
          <img
            src="/assets/fotoInicial.svg"
            alt="Oficina Mecânica"
            className="w-100 object-fit-cover h-450"
          />
        </div>

        <section className="container-fluid text-white py-3 px-4 bg-brand-orange">
          <div className="row text-center justify-content-around align-items-center">
            <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 my-2">
              <i className="fa-solid fa-users fa-2x"></i>
              <span className="fs-5 fw-bold">+1.500 Usuários Atendidos</span>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 my-2">
              <i className="fa-solid fa-wrench fa-2x"></i>
              <span className="fs-5 fw-bold">10 Anos de Experiência</span>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 my-2">
              <i className="fa-solid fa-heart fa-2x"></i>
              <span className="fs-5 fw-bold">98% Satisfação dos Clientes</span>
            </div>
          </div>
        </section>

        <section className="container my-5">
          <div className="text-white text-center py-2 rounded-top fw-bold fs-4 shadow-sm bg-brand-blue">
            Agendamento
          </div>
          <div className="bg-white p-4 rounded-bottom shadow-sm border border-top-0">
            <div className="row g-4 align-items-stretch">
              <div className="col-lg-6 d-flex flex-column gap-4">
                <div className="card card-action flex-grow-1 p-3 border-0 shadow-sm">
                  <div className="d-flex align-items-center h-100">
                    <div className="me-3 bg-light rounded overflow-hidden flex-shrink-0 image-box-80">
                      <img src="/assets/profissionaisCard.svg" alt="Profissionais" className="w-100 h-100 object-fit-cover" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Profissionais</h5>
                      <p className="text-muted small m-0">Conheça nossos critérios de seleção e seriedade empresarial.</p>
                    </div>
                  </div>
                </div>

                <div className="card card-action flex-grow-1 p-3 border-0 shadow-sm">
                  <div className="d-flex align-items-center h-100">
                    <div className="me-3 bg-light rounded overflow-hidden flex-shrink-0 image-box-80">
                      <img src="/assets/servicosCard.svg" alt="Serviços" className="w-100 h-100 object-fit-cover" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Serviços</h5>
                      <p className="text-muted small m-0">Explore a lista completa de serviços cobertos pela nossa oficina.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card bg-white text-dark h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-between">
                  <div>
                    <div className="mb-3 overflow-hidden rounded h-200">
                      <img src="/assets/agendamentoCard.svg" alt="Agendamento" className="w-100 h-100 object-fit-cover" />
                    </div>
                    <h4 className="fw-bold">Faça sua Avaliação e Agendamento</h4>
                    <p className="text-muted">
                      Garanta o melhor atendimento para o seu veículo de forma rápida e segura com profissionais qualificados.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn text-white fw-bold py-2 mt-3 border-0 bg-brand-orange"
                    onClick={agendarAgora}
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
