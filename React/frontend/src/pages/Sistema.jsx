import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sistema() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  async function sair() {
    await logout();
    navigate("/login");
  }

  const ehAdmin = usuario?.nivel === "admin";

  const modulosAdmin = [
    {
      titulo: "Clientes",
      descricao: "Cadastro e gerenciamento de clientes e contatos da oficina.",
      icone: "fa-user-group",
      gerenciar: "/painel-clientes",
      cadastrar: "/painel-clientes?acao=cadastrar",
    },
    {
      titulo: "Ordens de Serviço",
      descricao: "Controle de aberturas, andamentos e valores totais de OS.",
      icone: "fa-file-invoice-dollar",
      gerenciar: "/painel-ordens",
      cadastrar: "/cadastro-ordem-servico",
    },
    {
      titulo: "Estoque",
      descricao: "Gerenciamento de peças, quantidades e preços de venda.",
      icone: "fa-boxes-stacked",
      gerenciar: "/painel-estoque",
      cadastrar: "/painel-estoque?acao=cadastrar",
    },
    {
      titulo: "Veículos",
      descricao: "Visualização e cadastro de automóveis vinculados aos clientes.",
      icone: "fa-car",
      gerenciar: "/painel-veiculos",
      cadastrar: "/painel-veiculos?acao=cadastrar",
    },
    {
      titulo: "Funcionários",
      descricao: "Controle da equipe de mecânicos e operadores cadastrados.",
      icone: "fa-users-gear",
      gerenciar: "/painel-funcionarios",
      cadastrar: "/painel-funcionarios?acao=cadastrar",
    },
    {
      titulo: "Serviços",
      descricao: "Cadastro e gerenciamento dos serviços oferecidos pela oficina.",
      icone: "fa-screwdriver-wrench",
      gerenciar: "/painel-servicos",
      cadastrar: "/painel-servicos?acao=cadastrar",
    },
    {
      titulo: "Agendamentos",
      descricao: "Consulte e gerencie os agendamentos realizados pelos clientes.",
      icone: "fa-calendar-check",
      gerenciar: "/painel-agendamentos",
      cadastrar: null,
    },
  ];

  // Funcionário: vê e cria OS, vê e altera agendamentos.
  // Nada além disso no painel.
  const modulosFuncionario = [
    {
      titulo: "Ordens de Serviço",
      descricao: "Consulte, cadastre e acompanhe as ordens de serviço da oficina.",
      icone: "fa-file-invoice-dollar",
      gerenciar: "/painel-ordens",
      cadastrar: "/cadastro-ordem-servico",
    },
    {
      titulo: "Agendamentos",
      descricao: "Consulte e altere o status dos agendamentos dos clientes.",
      icone: "fa-calendar-check",
      gerenciar: "/painel-agendamentos",
      cadastrar: null,
    },
  ];

  const modulos = ehAdmin ? modulosAdmin : modulosFuncionario;

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3 bg-brand-blue">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-3" href="/">
            <span className="text-white">Vibe</span>
            <span className="text-dark">Mechanics</span>
            <span className="fs-6 badge bg-warning text-dark ms-2">
              {ehAdmin ? "Painel Admin" : "Painel Funcionário"}
            </span>
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white fw-semibold">{usuario?.nome}</span>
            <button className="btn btn-outline-light btn-sm fw-bold" onClick={sair}>
              <i className="fa-solid fa-right-from-bracket"></i> Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="fw-bold text-secondary">
              {ehAdmin ? "Gerenciamento do Sistema" : "Painel do Funcionário"}
            </h2>
            <p className="text-muted">
              {ehAdmin
                ? "Selecione abaixo o módulo que deseja gerenciar ou cadastrar."
                : "Bem-vindo ao VibeMechanics! Acesse as ferramentas necessárias para realizar seu trabalho."}
            </p>
          </div>
        </div>

        <div className="row g-4">
          {modulos.map((m) => (
            <div className="col-md-6 col-lg-4" key={m.titulo}>
              <div className="card shadow-sm border-0 h-100 text-center p-3">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <div className="mb-3 fs-1 text-brand-blue">
                      <i className={`fa-solid ${m.icone}`}></i>
                    </div>
                    <h5 className="card-title fw-bold">{m.titulo}</h5>
                    <p className="card-text text-muted small">{m.descricao}</p>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    {m.cadastrar && (
                      <a href={m.cadastrar} className="btn btn-brand flex-fill fw-bold">
                        <i className="fa-solid fa-plus-circle me-1"></i> Cadastrar
                      </a>
                    )}
                    <a href={m.gerenciar} className="btn btn-outline-primary flex-fill fw-bold">
                      <i className="fa-solid fa-sliders me-1"></i> Gerenciar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}