import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CadastroOrdemServico() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const osId = searchParams.get("id");

  const [veiculos, setVeiculos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [pecas, setPecas] = useState([]);
  const [servicos, setServicos] = useState([]);

  const [osAtual, setOsAtual] = useState(null);
  const [form, setForm] = useState({
    veiculo_id: "", funcionario_id: "", descricao: "",
    valor_base: 0, status: "pendente", observacoes: "",
  });

  const [pecaSel, setPecaSel] = useState({ peca_id: "", quantidade: 1 });
  const [servicoSel, setServicoSel] = useState({ servico_id: "" });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Modal de pagamento (espelha o #modalPagamentoOS do vanilla)
  const modalRef = useRef(null);
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const [finalizando, setFinalizando] = useState(false);

  async function carregarTudo() {
    try {
      const [vs, fs, ps, ss] = await Promise.all([
        api.veiculos.listar(),
        api.funcionarios.opcoes(),
        api.estoque.listar(),
        api.servicos.listar(),
      ]);
      setVeiculos(vs);
      setFuncionarios(fs);
      setPecas(ps.filter((p) => p.ativo));
      setServicos(ss.filter((s) => s.ativo));

      if (osId) {
        const os = await api.ordens.detalhar(osId);
        setOsAtual(os);
        setForm({
          veiculo_id: String(os.veiculo_id || ""),
          funcionario_id: String(os.funcionario_id || ""),
          descricao: os.descricao || "",
          valor_base: os.valor_base || 0,
          status: os.status || "pendente",
          observacoes: os.observacoes || "",
        });
      }
    } catch (e) {
      setErro(true);
      setMensagem(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, [osId]);

  function alterar(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function salvarFormulario(e) {
    e.preventDefault();
    setMensagem("");
    setErro(false);
    try {
      const dados = {
        veiculo_id: Number(form.veiculo_id),
        funcionario_id: form.funcionario_id ? Number(form.funcionario_id) : null,
        descricao: form.descricao.trim(),
        valor_base: Number(form.valor_base || 0),
        observacoes: form.observacoes.trim() || null,
      };
      if (osId) {
        await api.ordens.atualizar(osId, { ...dados, status: form.status });
        setMensagem("Ordem de serviço atualizada com sucesso.");
        await carregarTudo();
      } else {
        const nova = await api.ordens.cadastrar(dados);
        setMensagem("Ordem de serviço cadastrada.");
        navigate(`/cadastro-ordem-servico?id=${nova.id}`);
      }
    } catch (err) {
      setErro(true);
      setMensagem(err.message);
    }
  }

  async function adicionarPeca() {
    if (!pecaSel.peca_id || !pecaSel.quantidade) {
      alert("Selecione a peça e informe a quantidade.");
      return;
    }
    try {
      await api.ordens.adicionarPeca(osId, {
        peca_id: Number(pecaSel.peca_id),
        quantidade: Number(pecaSel.quantidade),
      });
      setPecaSel({ peca_id: "", quantidade: 1 });
      await carregarTudo();
    } catch (e) {
      alert(e.message);
    }
  }

  async function removerPeca(pecaId, quantidade) {
    try {
      await api.ordens.removerPeca(osId, pecaId, quantidade);
      await carregarTudo();
    } catch (e) {
      alert(e.message);
    }
  }

  async function adicionarServico() {
    if (!servicoSel.servico_id) {
      alert("Selecione um serviço.");
      return;
    }
    try {
      await api.ordens.adicionarServico(osId, { servico_id: Number(servicoSel.servico_id) });
      setServicoSel({ servico_id: "" });
      await carregarTudo();
    } catch (e) {
      alert(e.message);
    }
  }

  async function removerServico(servicoId) {
    try {
      await api.ordens.removerServico(osId, servicoId);
      await carregarTudo();
    } catch (e) {
      alert(e.message);
    }
  }

  // Abre o modal de pagamento (substitui o prompt do vanilla)
  function abrirModalPagamento() {
    if (!osAtual) {
      alert("Cadastre a ordem de serviço antes de finalizá-la.");
      return;
    }
    if (osAtual.status === "concluida") {
      alert("Esta ordem de serviço já está concluída.");
      return;
    }
    if (!osAtual.valor_total || osAtual.valor_total <= 0) {
      alert("A ordem de serviço precisa possuir valor maior que zero para ser finalizada.");
      return;
    }

    setMetodoPagamento("pix");

    if (modalRef.current && window.bootstrap?.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalRef.current).show();
    }
  }

  async function confirmarPagamento() {
    if (!metodoPagamento) {
      alert("Selecione uma forma de pagamento.");
      return;
    }

    setFinalizando(true);
    try {
      await api.ordens.finalizar(osId, metodoPagamento);

      if (modalRef.current && window.bootstrap?.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalRef.current).hide();
      }

      alert("Pagamento confirmado e ordem de serviço finalizada com sucesso.");
      await carregarTudo();
    } catch (e) {
      alert(e.message);
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} voltarPara="/painel-ordens" fallback="/painel-ordens" />

      <main className="container form-container-800">
        <div className="card shadow border-0 mb-4">
          <div className="card-body p-4">
            <h3 className="fw-bold section-title">
              {osId ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
            </h3>

            {mensagem && (
              <div className={`alert ${erro ? "alert-danger" : "alert-success"} d-flex justify-content-between`}>
                <span>{mensagem}</span>
                <button type="button" className="btn-close" onClick={() => setMensagem("")}></button>
              </div>
            )}

            <form className="row g-3" onSubmit={salvarFormulario}>
              <div className="col-md-6">
                <label className="form-label">Veículo</label>
                <select className="form-select" name="veiculo_id" value={form.veiculo_id} onChange={alterar} required>
                  <option value="">Selecione um veículo</option>
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} - {v.placa} {v.cliente_nome ? `| ${v.cliente_nome}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Funcionário responsável</label>
                <select className="form-select" name="funcionario_id" value={form.funcionario_id} onChange={alterar}>
                  <option value="">Não definido</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                      {f.cargo ? ` - ${f.cargo}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Descrição / defeito</label>
                <textarea className="form-control" name="descricao" rows="3"
                  value={form.descricao} onChange={alterar} required></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label">Valor da OS</label>
                <input type="number" step="0.01" min="0" className="form-control" name="valor_base"
                  value={form.valor_base} onChange={alterar} />
              </div>
              {osId && (
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={form.status} onChange={alterar}>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              )}
              <div className="col-12">
                <label className="form-label">Observações</label>
                <textarea className="form-control" name="observacoes" rows="2"
                  value={form.observacoes} onChange={alterar}></textarea>
              </div>
              <div className="col-12">
                <button className="btn btn-brand fw-bold" type="submit">
                  {osId ? "Salvar Alterações" : "Cadastrar Ordem de Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {carregando ? (
          <div className="empty-state">Carregando...</div>
        ) : (
          osAtual && (
            <>
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h5 className="fw-bold">
                        Peças <small className="text-muted fw-normal">(opcional)</small>
                      </h5>
                      <div className="input-group mb-3">
                        <select className="form-select" value={pecaSel.peca_id}
                          onChange={(e) => setPecaSel((s) => ({ ...s, peca_id: e.target.value }))}>
                          <option value="">Selecione uma peça</option>
                          {pecas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome} - {moeda(p.preco_venda)} | Estoque: {p.quantidade_estoque}
                            </option>
                          ))}
                        </select>
                        <input type="number" min="1" className="form-control"
                          value={pecaSel.quantidade}
                          onChange={(e) => setPecaSel((s) => ({ ...s, quantidade: e.target.value }))} />
                        <button type="button" className="btn btn-brand" onClick={adicionarPeca}>
                          Adicionar
                        </button>
                      </div>
                      <div className="os-item-list">
                        {(osAtual.pecas || []).length === 0 ? (
                          <div className="text-muted">Nenhuma peça adicionada.</div>
                        ) : (
                          osAtual.pecas.map((p) => (
                            <div key={p.peca_id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                              <span>{p.nome} — {p.quantidade} × {moeda(p.valor_unitario)}</span>
                              <button className="btn btn-danger btn-sm" type="button"
                                onClick={() => removerPeca(p.peca_id, p.quantidade)}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h5 className="fw-bold">
                        Serviços <small className="text-muted fw-normal">(opcional)</small>
                      </h5>
                      <div className="input-group mb-3">
                        <select className="form-select" value={servicoSel.servico_id}
                          onChange={(e) => setServicoSel({ servico_id: e.target.value })}>
                          <option value="">Selecione um serviço</option>
                          {servicos.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.descricao} - {moeda(s.valor_mao_obra)}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="btn btn-brand" onClick={adicionarServico}>
                          Adicionar
                        </button>
                      </div>
                      <div className="os-item-list">
                        {(osAtual.servicos || []).length === 0 ? (
                          <div className="text-muted">Nenhum serviço adicional.</div>
                        ) : (
                          osAtual.servicos.map((s) => (
                            <div key={s.servico_id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                              <span>{s.descricao} — {moeda(s.valor)}</span>
                              <button className="btn btn-danger btn-sm" type="button"
                                onClick={() => removerServico(s.servico_id)}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0 mt-4">
                <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <span className="text-muted">Total da OS</span>
                    <div className="summary-value">{moeda(osAtual.valor_total)}</div>
                  </div>
                  <button className="btn btn-success fw-bold" type="button"
                    onClick={abrirModalPagamento}
                    disabled={osAtual.status === "concluida"}>
                    Finalizar OS
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </main>

      {/* ============================================================
          Modal de Finalização / Pagamento
          Espelha o #modalPagamentoOS de cadastroOrdemServico.html
          ============================================================ */}
      <div
        ref={modalRef}
        className="modal fade"
        id="modalPagamentoOS"
        tabIndex="-1"
        aria-labelledby="tituloModalPagamento"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="tituloModalPagamento">
                Finalizar Ordem de Serviço
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Fechar"
              ></button>
            </div>

            <div className="modal-body">
              <p className="text-muted mb-3">
                Selecione a forma de pagamento para concluir a ordem de serviço.
              </p>

              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="pagamento_metodo">
                  Forma de pagamento
                </label>
                <select
                  className="form-select"
                  id="pagamento_metodo"
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                >
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="credito">Crédito</option>
                  <option value="debito">Débito</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <span className="fw-semibold">Valor total</span>
                <span className="fw-bold fs-5">{moeda(osAtual?.valor_total)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={finalizando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-success fw-bold"
                onClick={confirmarPagamento}
                disabled={finalizando}
              >
                <i className="fa-solid fa-check me-1"></i>
                {finalizando ? "Finalizando..." : "Confirmar pagamento e finalizar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}