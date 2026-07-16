#  VibeMecanic

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge" alt="Status" />
</p>

---

##  Integrantes da Equipe
* **Daniel Marques Da Silva Oliveira Junior**
* **Diana Lys Batista**

---

##  Sobre o Projeto

O **VibeMecanic** é um sistema moderno de gestão para oficinas mecânicas desenvolvido com foco em alta performance e praticidade. O objetivo principal do sistema é satisfazer as necessidades de controle de clientes e o gerenciamento de estoque de peças da oficina em um único lugar.

###  Como o sistema funciona?
O mecânico pode gerenciar todo o fluxo de trabalho de forma digital:
* Cadastrar e vincular veículos aos clientes.
* Gerenciar o estoque de peças (adicionando, editando ou excluindo itens).
* Registrar serviços e calcular automaticamente o valor total de cada atendimento.

---
---

##  Prototipação das Telas (Design)

O desenho das telas (front-end) foi planejado para ser simples e focado na produtividade do mecânico no dia a dia. 

>  **Link do Protótipo:** [Clique aqui para acessar o projeto no Figma/Canva](INSIRA_O_LINK_AQUI)

### Principais Interfaces Planejadas:
1. **Dashboard / Tela Inicial:** Exibe um resumo rápido das ordens de serviço do dia, nível de estoque de peças críticas e atalhos rápidos.
2. **Cadastro de Clientes e Veículos:** Formulário unificado para registrar um novo cliente e já vincular o seu respectivo carro na mesma tela.
3. **Controle de Estoque (Peças):** Uma listagem visual (estilo tabela) com busca rápida onde o mecânico pode adicionar, editar a quantidade ou excluir peças.
4. **Gerenciador de Ordens de Serviço (OS):** Tela dinâmica onde se seleciona o veículo do cliente, adiciona-se os serviços prestados e as peças utilizadas, exibindo o cálculo do valor total em tempo real.

---

##  Principais Funcionalidades

O **VibeMecanic** divide suas regras de negócio em três grandes pilares de funcionalidades:

* **Gestão de Atendimentos:**
  * Cadastro completo de clientes com validação de dados.
  * Vinculação direta de um ou mais carros por proprietário.
  * Registro de serviços com atribuição de valores de mão de obra.
* **Controle de Inventário (Estoque):**
  * Cadastro de peças contendo código, nome, preço unitário e quantidade disponível.
  * Atualização automática de quantidades no estoque conforme as peças são consumidas nas ordens de serviço.
* **Cálculos e Relatórios:**
  * Somatório automatizado de itens e serviços para evitar erros manuais de cobrança.
  * Histórico de consultas para analisar tudo o que já foi feito em um determinado carro no passado.

---

##  Entidades do Sistema (Banco de Dados)

Para sustentar a API no FastAPI, definimos as seguintes entidades principais que representam as tabelas em nosso banco de dados:

* **`Usuario` (Mecânico/Operador):** Quem opera o sistema (ID, Nome, Cargo, E-mail, Senha).
* **`Cliente`:** Dono do veículo (ID, Nome, Telefone, CPF).
* **`Veiculo`:** Carro do cliente (ID, Placa, Modelo, Marca, Ano, ID_Cliente).
* **`Peca`:** Peças disponíveis em estoque (ID, Nome, Preço, Quantidade).
* **`Servico`:** Catálogo de mão de obra disponível (ID, Descrição, Valor).
* **`OrdemServico` (OS):** O núcleo do sistema, que une o cliente, o veículo, as peças e os serviços prestados em um determinado atendimento (ID, Data, Status, Valor Total, ID_Veiculo).

##  Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **Python** | Linguagem de programação robusta e dinâmica. |
| **FastAPI** | Framework moderno, rápido (alta performance) para construir APIs. |
---

##  Estrutura do Repositório

* 📁 **[Documentação](./Documentação_Projeto/)**: Pasta contendo o levantamento completo de Requisitos Funcionais (RF) e Não Funcionais (RNF).
* 📄 **README.md**: Página inicial com a apresentação do projeto.

---
