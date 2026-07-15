classDiagram
    class Mecanico {
        +int id
        +string nome
        +string especialidade
        +string email
        +string senha
        +abrir_os()
        +finalizar_os()
    }

    class Cliente {
        +int id
        +string nome
        +string telefone
        +string cpf
    }

    class Veiculo {
        +string chassi
        +string placa
        +string modelo
        +string marca
        +int ano
        +int cliente_id
    }

    class Peca {
        +int id
        +string nome
        +float preco
        +int quantidade_estoque
    }

    class Servico {
        +int id
        +string descricao
        +float valor_mao_de_obra
    }

    class OrdemServico {
        +int id
        +string data_abertura
        +string status
        +float valor_total
        +string veiculo_chassi
        +int mecanico_id
        +calcular_total()
    }

    %% Relacionamentos
    Mecanico "1" --o "0..*" OrdemServico : executa
    Cliente "1" --o "0..*" Veiculo : possui
    Veiculo "1" --o "0..*" OrdemServico : recebe
    OrdemServico "0..*" --* "0..*" Peca : utiliza
    OrdemServico "0..*" --* "0..*" Servico : contem
