import { Link, useNavigate } from "react-router-dom";

// Navbar unificada, replicando o padrão das páginas do vanilla.
// - Botão "Voltar" à esquerda
// - Logo Vibe/Mechanics centralizado
// - Slot direito (ação ou área de autenticação)
export default function Navbar({
  voltarPara = null,
  fallback = "/",
  acao = null,
  usuario = null,
  onLogout = null,
}) {
  const navigate = useNavigate();

  function voltar() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate(voltarPara || fallback);
  }

  return (
    <nav className="navbar fixed-top shadow-sm py-1 bg-brand-blue z-navbar">
      <div className="container-fluid px-4">
        <div className="row w-100 align-items-center m-0">
          <div className="col-4 d-flex align-items-center">
            <button
              type="button"
              className="btn text-white p-0 fs-5 border-0 shadow-none d-flex align-items-center gap-2"
              onClick={voltar}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span className="d-none d-sm-inline">Voltar</span>
            </button>
          </div>

          <div className="col-4 text-center">
            <Link className="navbar-brand fw-bold fs-3 m-0" to="/">
              <span className="brand-light">Vibe</span>
              <span className="brand-dark">Mechanics</span>
            </Link>
          </div>

          <div className="col-4 d-flex justify-content-end align-items-center gap-2">
            {usuario ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-white fw-semibold small text-truncate user-name-limit">
                  <i className="fa-solid fa-user me-1"></i>
                  {usuario.nome}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm fw-semibold"
                  onClick={onLogout}
                >
                  Sair
                </button>
              </div>
            ) : acao ? (
              <Link to={acao.rota} className="btn btn-brand fw-bold">
                <i className="fa-solid fa-plus me-1"></i>
                <span className="d-none d-sm-inline">{acao.texto}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
