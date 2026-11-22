import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataHora = (v) => (v ? new Date(v).toLocaleString("pt-BR") : "-");

export default function HistoricoServicos() {
  const { usuario, logout } = useAuth();
  const [ordens, setOrdens] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await api.clientes.ordensServico(usuario.id);
        setOrdens(dados);
      } catch (e) {
        setMensagem(e.message);
      } finally {
        setCarregando(false);
      }
    }
    if (usuario) carregar();
  }, [usuario]);

  const filtradas = useMemo(() => {
    const termo = filtroTexto.trim().toLowerCase();
    return ordens.filter((o) => {
      if (filtroStatus && o.status !== filtroStatus) return false;
      if (!termo) return true;
      return [o.veiculo_placa, o.veiculo_modelo, o.descricao]
        .filter(Boolean).join(" ").toLowerCase().includes(termo);
    });
  }, [ordens, filtroStatus, filtroTexto]);

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} />
      <main className="container content-offset-navbar">
        <h1 className="fw-bold">Histórico de Serviços</h1>
        <p className="text-muted mb-4">Visualize suas ordens em andamento e concluídas.</p>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <select className="form-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluida">Concluídos</option>
                </select>
              </div>
              <div className="col-md-8">
                <input className="form-control" placeholder="Pesquisar por placa, modelo ou descrição..."
                  value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {mensagem && <div className="alert alert-danger">{mensagem}</div>}

        <div className="row g-3">
          {carregando ? (
            <div className="empty-state">Carregando...</div>
          ) : filtradas.length === 0 ? (
            <div className="empty-state">Nenhum serviço em andamento ou concluído.</div>
          ) : filtradas.map((o) => (
            <div className="col-12" key={o.id}>
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5 className="fw-bold mb-1">OS #{o.id} — {o.veiculo_modelo} ({o.veiculo_placa})</h5>
                      <p className="mb-1">{o.descricao}</p>
                      <small className="text-muted">Aberta em {dataHora(o.data_abertura)}</small>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${o.status === "concluida" ? "bg-success" : "bg-warning text-dark"}`}>
                        {o.status === "concluida" ? "Concluída" : "Em andamento"}
                      </span>
                      <div className="fw-bold mt-2">{moeda(o.valor_total)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
