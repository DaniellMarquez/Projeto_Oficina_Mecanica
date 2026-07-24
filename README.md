#  VibeMechanics

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge" alt="Status" />
</p>

---

##  Integrantes da Equipe
* **Diana Lys Batista**
* **Daniel Marques Da Silva Oliveira Junior**

---

##  Sobre o Projeto


&emsp;O **VibeMechanics** é um sistema moderno de gestão para oficinas mecânicas desenvolvido com foco em alta performance, robustez e praticidade. O objetivo principal do sistema é centralizar e otimizar o fluxo operacional de reparos, o controle histórico de veículos atendidos, o desempenho dos mecânicos, o estoque de inventário e o faturamento financeiro da oficina.

###  Como o sistema funciona?

&emsp;O mecânico gerencia todo o fluxo de trabalho de forma 100% digital e segura:
* Cadastra e vincula múltiplos veículos aos perfis dos clientes.
* Gerencia o catálogo geral de peças e o controle físico do estoque.
* Registra a mão de obra aplicada por meio de serviços tabelados.
* Abre ordens de serviço dinâmicas que calculam automaticamente os valores totais e faturam o fluxo com registros únicos de pagamentos.

---

##  Prototipação das Telas (Design)


&emsp;O desenho das interfaces web foi planejado estrategicamente para ser simples, intuitivo e focado na produtividade do mecânico no dia a dia da oficina.

> 🔗 **Link do Protótipo:** [Clique aqui para acessar o projeto no Figma/Canva](INSIRA_O_LINK_AQUI)

### Principais Interfaces Planejadas (Web Responsiva):
1. **Dashboard / Tela Inicial:** Exibe um resumo rápido das ordens de serviço do dia, nível de estoque de peças críticas e atalhos rápidos de navegação.
2. **Cadastro de Clientes e Veículos:** Formulário inteligente para registrar um novo cliente e já vincular o seu respectivo carro na mesma tela.
3. **Controle de Estoque (Peças):** Uma listagem visual estruturada em tabela com busca rápida para adicionar, alterar quantidades ou rastrear peças.
4. **Gerenciador de Ordens de Serviço (OS):** Tela dinâmica onde se seleciona o veículo, anexa-se os serviços prestados, deduz as peças do estoque e exibe o cálculo do valor total em tempo real com o botão para efetuar pagamento.

---

##  Principais Funcionalidades


&emsp;O **VibeMecanic** divide suas regras de negócio em três grandes pilares operacionais:

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

## Entidades do Sistema (Banco de Dados)


&emsp;Para sustentar o funcionamento do VibeMechanics, a estrutura relacional do banco de dados foi modelada seguindo os princípios da Terceira Forma Normal (3FN), garantindo organização, redução de redundância e integridade das informações.


&emsp;O banco de dados é composto pelas seguintes entidades:
* **`cliente`:** Representa os proprietários dos veículos e usuários do sistema. Armazena informações de identificação e acesso (ID, Nome, CPF, E-mail e Senha).
* **`funcionario`:** Representa os colaboradores responsáveis pela execução e acompanhamento dos serviços da oficina. Armazena dados pessoais, profissionais e de acesso (ID, Nome, CPF, Telefone, Estado Civil, Endereço, Cargo, E-mail e Senha).
* **`veiculo`:** Representa os veículos atendidos pela oficina e mantém o vínculo com seus respectivos proprietários (Chassi, Placa, Marca, Modelo, Ano e Cliente_ID).
* **`agendamento`:** Controla os horários de atendimento previamente marcados pelos clientes, vinculando o agendamento ao veículo correspondente (ID, Veiculo_Chassi, Data_Agendamento e Status).
* **`ordem_servico`:** Representa o principal registro operacional do sistema, reunindo todas as informações do atendimento realizado pela oficina (ID, Descrição do Serviço, Data de Abertura, Data de Fechamento, Status, Valor Total, Observações, Veiculo_Chassi e Funcionario_ID).
* **`pagamento`:** Responsável pelo controle financeiro dos serviços realizados, mantendo uma relação de um para um (1:1) com a ordem de serviço correspondente (ID, Valor, Método de Pagamento, Data de Pagamento, Status do Pagamento e OS_ID).
* **`peca`:** Representa o catálogo de peças e o controle de estoque da oficina, armazenando informações comerciais e de quantidade disponível (ID, Nome, Marca, Fabricante, Preço de Compra, Preço de Venda e Quantidade em Estoque).
* **`servico`:** Representa o catálogo de serviços oferecidos pela oficina, contendo os valores referentes à mão de obra (ID, Descrição e Valor da Mão de Obra).
* **`os_pecas`:** Tabela intermediária responsável pelo relacionamento Muitos-para-Muitos (N:M) entre ordens de serviço e peças. Permite registrar quais peças foram utilizadas em cada atendimento e suas respectivas quantidades (OS_ID, Peca_ID e Quantidade).
* **`os_servicos`:** Tabela intermediária responsável pelo relacionamento Muitos-para-Muitos (N:M) entre ordens de serviço e serviços disponíveis no catálogo. Permite associar diversos serviços realizados em uma mesma ordem de serviço (OS_ID e Servico_ID).

&emsp;A modelagem permite que o sistema controle todo o fluxo da oficina, desde o cadastro do cliente e veículo, passando pelo agendamento e execução do serviço, até o registro das peças utilizadas, serviços realizados e pagamento final.

---

##  Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **Python** | Linguagem de programação de alta legibilidade, robusta e amplamente adotada. |
| **FastAPI** | Framework moderno, de alta performance e assíncrono para construção ágil de APIs. |
| **MySQL (v8.0+)** | Sistema Gerenciador de Banco de Dados Relacional (SGBD) para armazenamento seguro dos dados. |

---

##  Estrutura do Repositório
* **[Wiki contendo toda a documentação do projeto](https://github.com/DaniellMarquez/Projeto_Oficina_Mecanica/wiki)
*  **README.md**: Página inicial com a contextualização, apresentação e tecnologias do projeto.
