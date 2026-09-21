from pathlib import Path

import bcrypt
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from mysql.connector import IntegrityError

from database import criar_conexao
from schemas import ClienteCreate, ClienteResponse, ClienteUpdate

app = FastAPI(title="Oficina Mecânica")

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Só monta o frontend se a pasta existir (evita erro ao subir o servidor)
if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")


# ================= FUNÇÕES AUXILIARES =================

def gerar_hash(senha: str) -> str:
    """Transforma a senha em hash (nunca guardamos a senha pura)."""
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ================= PÁGINAS =================

@app.get("/", include_in_schema=False)
def pagina_inicial():
    arquivo = FRONTEND_DIR / "index.html"

    if not arquivo.exists():
        raise HTTPException(
            status_code=404,
            detail="frontend/index.html ainda não foi criado. Use /docs para testar a API."
        )

    return FileResponse(arquivo)


@app.get("/cadastro-de-cliente", include_in_schema=False)
def pagina_cadastro_cliente():
    return FileResponse(FRONTEND_DIR / "cadastrodecliente.html")


@app.get("/lista-de-clientes", include_in_schema=False)
def pagina_lista_clientes():
    return FileResponse(FRONTEND_DIR / "listadeclientes.html")


# ================= CLIENTES =================

@app.get("/cliente", response_model=list[ClienteResponse])
def listar_clientes():
    conexao = criar_conexao()
    cursor = conexao.cursor()

    try:
        # Colunas listadas de propósito: a senha NÃO é selecionada
        cursor.execute("SELECT id, nome, cpf, email FROM cliente")
        registros = cursor.fetchall()
    finally:
        cursor.close()
        conexao.close()

    return [
        {
            "id": registro[0],
            "nome": registro[1],
            "cpf": registro[2],
            "email": registro[3],
        }
        for registro in registros
    ]


@app.post("/cliente", response_model=ClienteResponse)
def cadastrar_cliente(cliente: ClienteCreate):
    conexao = criar_conexao()
    cursor = conexao.cursor()

    sql = """
        INSERT INTO cliente (nome, cpf, email, senha)
        VALUES (%s, %s, %s, %s)
    """
    valores = (
        cliente.nome,
        cliente.cpf,
        cliente.email,
        gerar_hash(cliente.senha),
    )

    try:
        cursor.execute(sql, valores)
        conexao.commit()
        id_cliente = cursor.lastrowid

        return {
            "id": id_cliente,
            "nome": cliente.nome,
            "cpf": cliente.cpf,
            "email": cliente.email,
        }

    except IntegrityError as erro:
        conexao.rollback()

        if erro.errno == 1062:
            raise HTTPException(
                status_code=409,
                detail="CPF ou E-mail já cadastrado."
            )

        raise HTTPException(
            status_code=500,
            detail="Erro de integridade no banco de dados."
        )

    finally:
        cursor.close()
        conexao.close()


@app.put("/cliente/{id}", response_model=ClienteResponse)
def alterar_cliente(id: int, cliente: ClienteUpdate):

    # Se veio senha nova, ela precisa ter pelo menos 6 caracteres
    if cliente.senha and len(cliente.senha) < 6:
        raise HTTPException(
            status_code=422,
            detail="A senha deve ter pelo menos 6 caracteres."
        )

    conexao = criar_conexao()
    cursor = conexao.cursor()

    try:
        if cliente.senha:
            sql = """
                UPDATE cliente
                SET nome = %s, cpf = %s, email = %s, senha = %s
                WHERE id = %s
            """
            valores = (
                cliente.nome,
                cliente.cpf,
                cliente.email,
                gerar_hash(cliente.senha),
                id,
            )
        else:
            # Sem senha nova: mantém a senha que já está no banco
            sql = """
                UPDATE cliente
                SET nome = %s, cpf = %s, email = %s
                WHERE id = %s
            """
            valores = (
                cliente.nome,
                cliente.cpf,
                cliente.email,
                id,
            )

        cursor.execute(sql, valores)

        # Atenção: rowcount = 0 também acontece se nada mudou de fato.
        # Por isso confirmamos a existência do cliente separadamente.
        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM cliente WHERE id = %s", (id,))

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Cliente não encontrado."
                )

        conexao.commit()

        return {
            "id": id,
            "nome": cliente.nome,
            "cpf": cliente.cpf,
            "email": cliente.email,
        }

    except IntegrityError as erro:
        conexao.rollback()

        if erro.errno == 1062:
            raise HTTPException(
                status_code=409,
                detail="CPF ou E-mail já cadastrado."
            )

        raise HTTPException(
            status_code=500,
            detail="Erro de integridade no banco de dados."
        )

    finally:
        cursor.close()
        conexao.close()


@app.delete("/cliente/{id}")
def excluir_cliente(id: int):
    conexao = criar_conexao()
    cursor = conexao.cursor()

    try:
        cursor.execute("DELETE FROM cliente WHERE id = %s", (id,))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Cliente não encontrado."
            )

        conexao.commit()

        return {"mensagem": "Cliente excluído com sucesso."}

    except IntegrityError:
        # Acontece quando a FK está como RESTRICT e o cliente tem veículos
        conexao.rollback()
        raise HTTPException(
            status_code=409,
            detail="Não é possível excluir: o cliente possui veículos cadastrados."
        )

    finally:
        cursor.close()
        conexao.close()


# ================= PRÓXIMAS ENTIDADES =================
# Adicione aqui embaixo, uma por vez (NÃO substitua o que já existe):
#   VEÍCULO  -> chave primária é "chassi" (texto): use chassi: str na rota
#   SERVIÇO, PEÇA, FUNCIONÁRIO, MECÂNICO, GERENTE, ...