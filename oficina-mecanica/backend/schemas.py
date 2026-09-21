from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ================= CLIENTE =================

class ClienteCreate(BaseModel):
    nome: str
    cpf: str
    email: EmailStr
    senha: str = Field(min_length=6, max_length=50)


class ClienteUpdate(BaseModel):
    nome: str
    cpf: str
    email: EmailStr
    # No PUT a senha é opcional: se vier vazia/ausente, mantém a atual
    senha: Optional[str] = Field(default=None, max_length=50)


class ClienteResponse(BaseModel):
    id: int
    nome: str
    cpf: str
    email: EmailStr
    # de propósito NÃO tem "senha": a API nunca devolve a senha