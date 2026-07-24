-- CRIAÇÃO DO BANCO

CREATE DATABASE IF NOT EXISTS Oficina;
USE Oficina;

-- CLIENTE

CREATE TABLE cliente(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- FUNCIONÁRIO

CREATE TABLE funcionario(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    estado_civil VARCHAR(30),
    endereco VARCHAR(200),
    cargo VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- VEÍCULO

CREATE TABLE veiculo(
    chassi VARCHAR(30) PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    cliente_id INT NOT NULL,

    CONSTRAINT fk_veiculo_cliente
        FOREIGN KEY(cliente_id)
        REFERENCES cliente(id)
        ON DELETE CASCADE
);

-- CATÁLOGO DE SERVIÇOS

CREATE TABLE servico(
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(200) NOT NULL,
    valor_mao_obra DECIMAL(10,2) NOT NULL
);

-- PEÇAS

CREATE TABLE peca(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    marca VARCHAR(100),
    fabricante VARCHAR(100),
    preco_compra DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    quantidade_estoque INT DEFAULT 0
);

-- AGENDAMENTO

CREATE TABLE agendamento(
    id INT AUTO_INCREMENT PRIMARY KEY,

    veiculo_chassi VARCHAR(30) NOT NULL,

    data_agendamento DATE NOT NULL,

    status VARCHAR(30) DEFAULT 'Agendado',

    CONSTRAINT fk_agendamento_veiculo
        FOREIGN KEY(veiculo_chassi)
        REFERENCES veiculo(chassi)
        ON DELETE CASCADE
);

-- ORDEM DE SERVIÇO

CREATE TABLE ordem_servico(

    id INT AUTO_INCREMENT PRIMARY KEY,

    descricao_servico VARCHAR(300) NOT NULL,

    data_abertura DATE NOT NULL,

    data_fechamento DATE,

    status VARCHAR(30) DEFAULT 'Em andamento',

    valor_total DECIMAL(10,2) DEFAULT 0,

    observacoes VARCHAR(300),

    veiculo_chassi VARCHAR(30),

    funcionario_id INT,

    CONSTRAINT fk_os_veiculo
        FOREIGN KEY(veiculo_chassi)
        REFERENCES veiculo(chassi)
        ON DELETE CASCADE,

    CONSTRAINT fk_os_funcionario
        FOREIGN KEY(funcionario_id)
        REFERENCES funcionario(id)
        ON DELETE SET NULL
);

-- PAGAMENTO

CREATE TABLE pagamento(

    id INT AUTO_INCREMENT PRIMARY KEY,

    valor DECIMAL(10,2) NOT NULL,

    metodo_pagamento VARCHAR(50) NOT NULL,

    data_pagamento DATE NOT NULL,

    status_pagamento VARCHAR(30) NOT NULL,

    os_id INT UNIQUE,

    CONSTRAINT fk_pagamento_os
        FOREIGN KEY(os_id)
        REFERENCES ordem_servico(id)
        ON DELETE CASCADE
);


-- PEÇAS UTILIZADAS EM CADA ORDEM DE SERVIÇO

CREATE TABLE os_pecas(
    os_id INT,
    peca_id INT,
    quantidade INT DEFAULT 1,

    PRIMARY KEY(os_id, peca_id),

    FOREIGN KEY(os_id)
        REFERENCES ordem_servico(id),

    FOREIGN KEY(peca_id)
        REFERENCES peca(id)
);


-- SERVIÇOS REALIZADOS EM CADA ORDEM

CREATE TABLE os_servicos(

    os_id INT,

    servico_id INT,

    PRIMARY KEY(os_id, servico_id),

    CONSTRAINT fk_osservico_os
        FOREIGN KEY(os_id)
        REFERENCES ordem_servico(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_osservico_servico
        FOREIGN KEY(servico_id)
        REFERENCES servico(id)
);
