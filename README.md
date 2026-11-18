# 🔧 VibeMechanics

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge" alt="Status" />
</p>

---

## 👥 Integrantes da Equipe

- **Diana Lys Batista**
- **Daniel Marques Da Silva Oliveira Junior**

---

## 📌 Sobre o Projeto

O **VibeMechanics** é um sistema de gerenciamento para oficinas mecânicas, desenvolvido com o objetivo de centralizar e otimizar os processos administrativos e operacionais de uma oficina.

A plataforma busca facilitar o gerenciamento de clientes, veículos, funcionários, serviços, agendamentos, ordens de serviço, peças e pagamentos, proporcionando maior organização, segurança e praticidade no controle das atividades.

O projeto utiliza uma arquitetura composta por frontend em React, backend em Python com FastAPI e banco de dados MySQL.

### ⚙️ Como o sistema funciona?

O sistema permite que os usuários realizem diferentes operações de acordo com seu nível de acesso:

- Cadastro e gerenciamento de clientes.
- Cadastro e vinculação de veículos aos respectivos proprietários.
- Gerenciamento de funcionários e suas informações.
- Cadastro e controle dos serviços oferecidos pela oficina.
- Controle de peças e movimentações do estoque.
- Criação e gerenciamento de ordens de serviço.
- Consulta e gerenciamento de agendamentos.
- Registro e acompanhamento de pagamentos.

---

## 🎨 Prototipação das Telas (Design)

O desenvolvimento das interfaces foi planejado para proporcionar uma experiência simples, intuitiva e organizada, facilitando a utilização do sistema pelos diferentes usuários.

> 🔗 **Link do Protótipo:** [Clique aqui para acessar o projeto no Figma/Canva](INSIRA_O_LINK_AQUI)

### Principais Interfaces

1. **Home / Dashboard:** Página inicial com navegação e acesso às funcionalidades disponíveis conforme o tipo de usuário.
2. **Clientes:** Cadastro, consulta e gerenciamento dos clientes da oficina.
3. **Veículos:** Cadastro e gerenciamento dos veículos vinculados aos clientes.
4. **Funcionários:** Controle dos colaboradores, incluindo cadastro, consulta, edição e gerenciamento de seus registros.
5. **Serviços:** Cadastro e gerenciamento dos serviços oferecidos pela oficina e seus valores de mão de obra.
6. **Estoque:** Controle de peças, quantidades disponíveis e informações comerciais.
7. **Ordens de Serviço:** Gerenciamento dos atendimentos, serviços executados, peças utilizadas e informações relacionadas.
8. **Agendamentos:** Consulta e gerenciamento dos horários de atendimento realizados pelos clientes.
9. **Login:** Autenticação dos usuários para acesso às funcionalidades autorizadas.

---

## 🚀 Principais Funcionalidades

O VibeMechanics organiza suas funcionalidades em diferentes módulos:

### 👤 Gestão de Usuários e Atendimentos

- Cadastro e gerenciamento de clientes.
- Armazenamento de informações pessoais e de contato.
- Vinculação de múltiplos veículos a um cliente.
- Cadastro e gerenciamento de funcionários.
- Controle de acesso conforme o tipo de usuário.
- Autenticação e gerenciamento de sessões.

### 🚗 Gestão de Veículos

- Cadastro de veículos.
- Associação de veículos aos respectivos clientes.
- Consulta das informações dos veículos cadastrados.
- Utilização dos veículos nos agendamentos e ordens de serviço.

### 📅 Gerenciamento de Agendamentos

- Registro de agendamentos realizados pelos clientes.
- Consulta dos agendamentos cadastrados.
- Atualização de informações e status dos agendamentos.
- Associação dos agendamentos aos veículos.

### 🔩 Controle de Serviços e Ordens de Serviço

- Cadastro e gerenciamento dos serviços oferecidos.
- Definição dos valores de mão de obra.
- Criação e gerenciamento de ordens de serviço.
- Associação de funcionários responsáveis pelos atendimentos.
- Registro dos serviços e peças utilizados.
- Acompanhamento do andamento dos atendimentos.

### 📦 Controle de Estoque

- Cadastro e gerenciamento de peças.
- Armazenamento de preços e quantidades disponíveis.
- Acompanhamento das informações do inventário.
- Integração do controle de peças com as ordens de serviço.

### 💰 Controle Financeiro

- Cálculo dos valores relacionados aos serviços e peças utilizados.
- Registro de pagamentos associados às ordens de serviço.
- Organização das informações financeiras dos atendimentos.
- Suporte a diferentes métodos de pagamento, como PIX, cartões e dinheiro.

---

## 🔐 Autenticação e Segurança

O sistema possui um mecanismo de autenticação integrado entre o frontend React e o backend FastAPI.

### Principais recursos:

- Autenticação de usuários por meio de login.
- Gerenciamento de sessões utilizando cookies HTTP.
- Envio de cookies nas requisições do frontend por meio de `credentials: "include"`.
- Verificação da sessão do usuário através do endpoint `/me`.
- Encerramento da sessão por meio do endpoint `/logout`.
- Controle de autorização conforme o tipo de usuário.
- Restrição de acesso às funcionalidades de acordo com as permissões definidas no backend.
- Configuração de CORS para permitir a comunicação entre frontend e backend com envio de credenciais.

### Níveis de acesso

O sistema trabalha com diferentes categorias de usuários:

- **Administrador:** acesso às funcionalidades administrativas e ao gerenciamento geral do sistema.
- **Funcionário:** acesso às funcionalidades operacionais autorizadas.
- **Cliente:** acesso às funcionalidades destinadas ao acompanhamento e utilização dos serviços da oficina.

A autenticação e a autorização são controladas pelo backend, evitando que o acesso às funcionalidades dependa exclusivamente das restrições visuais do frontend.

---

## 🗄️ Entidades do Sistema (Banco de Dados)

A estrutura do banco de dados foi planejada utilizando o modelo relacional, buscando garantir organização, integridade referencial e redução de redundâncias.

O banco de dados é composto pelas seguintes entidades:

- **`cliente`:** representa os clientes da oficina, armazenando informações de identificação e acesso, como nome, CPF, e-mail e senha.
- **`funcionario`:** representa os colaboradores responsáveis pela execução e acompanhamento dos serviços. Armazena informações pessoais, profissionais e de acesso.
- **`veiculo`:** representa os veículos atendidos pela oficina, mantendo o vínculo com seus respectivos proprietários.
- **`agendamento`:** controla os horários de atendimento, vinculando cada agendamento ao veículo correspondente.
- **`ordem_servico`:** representa o registro operacional dos atendimentos realizados pela oficina, reunindo informações sobre o serviço, datas, status, valores e responsáveis.
- **`pagamento`:** registra as informações financeiras relacionadas às ordens de serviço.
- **`peca`:** representa o catálogo de peças e o controle de estoque, armazenando informações comerciais e quantidades disponíveis.
- **`servico`:** representa o catálogo de serviços oferecidos pela oficina, incluindo os valores de mão de obra.
- **`os_pecas`:** tabela intermediária responsável pelo relacionamento muitos-para-muitos (N:M) entre ordens de serviço e peças, registrando as quantidades utilizadas.
- **`os_servicos`:** tabela intermediária responsável pelo relacionamento muitos-para-muitos (N:M) entre ordens de serviço e serviços disponíveis no catálogo.

A modelagem permite representar o fluxo de funcionamento da oficina, desde o cadastro do cliente e de seu veículo até o agendamento, execução dos serviços, utilização de peças e registro dos pagamentos.

---

## 💻 Tecnologias Utilizadas

| Tecnologia | Aplicação no Projeto |
| :--- | :--- |
| **React** | Desenvolvimento da interface do usuário e construção dos componentes frontend. |
| **JavaScript** | Linguagem utilizada na implementação das funcionalidades do frontend. |
| **React Router** | Gerenciamento das rotas e navegação entre as páginas da aplicação. |
| **HTML5** | Estruturação dos elementos das interfaces. |
| **CSS3** | Estilização e organização visual das páginas. |
| **Python** | Linguagem utilizada no desenvolvimento do backend. |
| **FastAPI** | Framework responsável pela construção da API e gerenciamento das requisições. |
| **MySQL 8.0+** | Sistema gerenciador de banco de dados relacional. |

---

## 🏗️ Arquitetura do Sistema

O projeto utiliza uma arquitetura dividida em frontend, backend e banco de dados.

### Frontend — React

Responsável pela interface visual, navegação entre páginas, formulários e interação com o usuário.

Utiliza React Router para gerenciamento das rotas e comunicação com a API por meio de requisições HTTP.

### Backend — Python e FastAPI

Responsável pelas regras de negócio, processamento das requisições, autenticação, autorização e comunicação com o banco de dados.

Disponibiliza endpoints para as operações de cadastro, consulta, atualização e gerenciamento das informações.

### Banco de Dados — MySQL

Responsável pelo armazenamento persistente das informações do sistema, utilizando relacionamentos entre as entidades para manter a integridade dos dados.

---

## 📁 Estrutura do Repositório

O projeto está organizado em diretórios que separam as responsabilidades do frontend e do backend.

- **Frontend:** aplicação React, componentes, páginas, estilos e configurações de navegação.
- **Backend:** API desenvolvida em Python com FastAPI, autenticação, regras de negócio e integração com o banco de dados.
- **Banco de Dados:** estrutura relacional utilizada para armazenar as informações da oficina.
- **README.md:** documentação principal do projeto.
- **Wiki:** documentação complementar.

🔗 **[Acesse a Wiki do Projeto](https://github.com/DaniellMarquez/Projeto_Oficina_Mecanica/wiki)**

---

## 🚧 Status do Projeto

O **VibeMechanics** encontra-se em desenvolvimento.

Atualmente, o projeto está passando pela implementação e integração de sua interface utilizando React, mantendo a API desenvolvida em FastAPI e o banco de dados MySQL.

As funcionalidades estão sendo desenvolvidas e aprimoradas progressivamente, incluindo autenticação, gerenciamento de sessões por cookies, controle de permissões e integração entre frontend e backend.

---
