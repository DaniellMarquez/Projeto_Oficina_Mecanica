import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import CadastroClientes from "./pages/CadastroClientes";
import Veiculos from "./pages/Veiculos";
import OrdensServico from "./pages/OrdensServico";
import Estoque from "./pages/Estoque";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";

import Funcionarios from "./pages/Funcionarios";
import Servicos from "./pages/Servicos";
import Agendamentos from "./pages/Agendamentos";

import "./App.css";
import "./estilo.css";

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <div className="content">
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={<Home />} />

                        <Route
                            path="/cadastro-clientes"
                            element={<CadastroClientes />}
                        />

                        <Route
                            path="/clientes"
                            element={<Clientes />}
                        />

                        <Route
                            path="/funcionarios"
                            element={<Funcionarios />}
                        />

                        <Route
                            path="/servicos"
                            element={<Servicos />}
                        />

                        <Route
                            path="/agendamentos"
                            element={<Agendamentos />}
                        />

                        <Route
                            path="/veiculos"
                            element={<Veiculos />}
                        />

                        <Route
                            path="/ordens-servico"
                            element={<OrdensServico />}
                        />

                        <Route
                            path="/estoque"
                            element={<Estoque />}
                        />

                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;