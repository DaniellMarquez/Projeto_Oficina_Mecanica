#  VibeMecanic

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge" alt="Status" />
</p>

---

##  Integrantes da Equipe
* **Daniel Marques Da Silva Oliveira Junior**
* **Diana Lys Batista**

---

##  Sobre o Projeto

O **VibeMecanic** é um sistema moderno de gestão para oficinas mecânicas desenvolvido com foco em alta performance, robustez e praticidade. O objetivo principal do sistema é centralizar e otimizar o fluxo operacional de reparos, o controle histórico de veículos atendidos, o desempenho dos mecânicos, o estoque de inventário e o faturamento financeiro da oficina.

###  Como o sistema funciona?
O mecânico gerencia todo o fluxo de trabalho de forma 100% digital e segura:
* Cadastra e vincula múltiplos veículos aos perfis dos clientes.
* Gerencia o catálogo geral de peças e o controle físico do estoque.
* Registra a mão de obra aplicada por meio de serviços tabelados.
* Abre ordens de serviço dinâmicas que calculam automaticamente os valores totais e faturam o fluxo com registros únicos de pagamentos.

---

##  Prototipação das Telas (Design)

O desenho das interfaces web foi planejado estrategicamente para ser simples, intuitivo e focado na produtividade do mecânico no dia a dia da oficina.

> 🔗 **Link do Protótipo:** [Clique aqui para acessar o projeto no Figma/Canva](INSIRA_O_LINK_AQUI)

### Principais Interfaces Planejadas (Web Responsiva):
1. **Dashboard / Tela Inicial:** Exibe um resumo rápido das ordens de serviço do dia, nível de estoque de peças críticas e atalhos rápidos de navegação.
2. **Cadastro de Clientes e Veículos:** Formulário inteligente para registrar um novo cliente e já vincular o seu respectivo carro na mesma tela.
3. **Controle de Estoque (Peças):** Uma listagem visual estruturada em tabela com busca rápida para adicionar, alterar quantidades ou rastrear peças.
4. **Gerenciador de Ordens de Serviço (OS):** Tela dinâmica onde se seleciona o veículo, anexa-se os serviços prestados, deduz as peças do estoque e exibe o cálculo do valor total em tempo real com o botão para efetuar pagamento.

---

##  Principais Funcionalidades

O **VibeMecanic** divide suas regras de negócio em três grandes pilares operacionais:

* **Gestão de Atendimentos:**
  * Cadastro completo de clientes com validação rigorosa de CPFs e contatos.
  * Vinculação de histórico e propriedade direta de múltiplos carros por cliente.
  * Registro detalhado de mecânicos responsáveis pela execução técnica.
* **Controle de Inventário (Estoque):**
  * Cadastro de peças contendo preço de custo, preço de venda e quantidade física atual.
  * Atualização e baixa automatizada do estoque conforme o consumo em ordens de serviço ativas.
  * Proteção de integridade referencial que impede a exclusão acidental de itens com histórico financeiro vinculado.
* **Cálculos e Faturamento:**
  * Somatório automatizado de `(quantidade_de_pecas * preco_venda)` + `valor_mao_obra` para mitigar erros manuais.
  * Emissão de faturamento integrado por meio de uma tabela exclusiva de pagamentos (PIX, cartões ou dinheiro).

---

##  Entidades do Sistema (Banco de Dados)

Para sustentar a API construída no FastAPI, a estrutura relacional do nosso banco de dados foi normalizada na Terceira Forma Normal (3FN), composta pelas seguintes tabelas:

* **`mecanico`:** Operador técnico do sistema (ID, Nome, Especialidade, E-mail, Senha).
* **`cliente`:** Proprietário e contratante (ID, Nome, Telefone, CPF).
* **`veiculo`:** Carro sob cuidados da oficina (Chassi, Placa, Modelo, Marca, Ano, Cliente_ID).
* **`Ordem_Servico`:** Núcleo central transacional que agrupa dados do atendimento (ID, Data Abertura, Status, Valor Total, Veiculo_Chassi, Mecanico_ID).
* **`pagamento`:** Registro financeiro e fluxo de caixa associado de forma única (1:1) à OS (ID, Valor, Método Pagamento, Data, Status Pagamento, OS_ID).
* **`peca`:** Catálogo geral de componentes e inventário da oficina (ID, Nome, Preço, Preço Venda, Quantidade Estoque).
* **`servico`:** Catálogo de valores de mão de obra tabelados (ID, Descrição, Valor Mão Obra).
* **`os_pecas` / `os_servicos`:** Tabelas intermediárias associativas que quebram as relações Muitos-para-Muitos (N:M), permitindo múltiplos itens por atendimento sem redundância de dados.

---

##  Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **Python** | Linguagem de programação de alta legibilidade, robusta e amplamente adotada. |
| **FastAPI** | Framework moderno, de alta performance e assíncrono para construção ágil de APIs. |
| **MySQL (v8.0+)** | Sistema Gerenciador de Banco de Dados Relacional (SGBD) para armazenamento seguro dos dados. |

---

##  Estrutura do Repositório

*  **[Documentação](./Documentacao_Projeto/)**: Pasta contendo a especificação completa de Requisitos Funcionais (RF), Requisitos Não Funcionais (RNFs Web), Diagrama de Arquitetura de Dados (UML/Mermaid) e o script DDL compilado.
*  **README.md**: Página inicial com a contextualização, apresentação e tecnologias do projeto.
