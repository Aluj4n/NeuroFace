import os

from datetime import (
    datetime,
    timedelta,
    timezone
)

import jwt

from dotenv import load_dotenv


# ==================================================
# VARIABLES DE ENTORNO
# ==================================================

load_dotenv()


JWT_SECRET = os.getenv(
    "JWT_SECRET"
)


if not JWT_SECRET:

    raise RuntimeError(
        "No se encontró JWT_SECRET en el archivo .env"
    )


ALGORITHM = "HS256"

TOKEN_HORAS = 8


# ==================================================
# CREAR TOKEN
# ==================================================

def crear_token(
    usuario: str,
    rol: str
):

    ahora = datetime.now(
        timezone.utc
    )


    payload = {

        # Usuario dueño del token
        "sub": usuario,

        # Rol
        "rol": rol,

        # Fecha creación
        "iat": ahora,

        # Fecha expiración
        "exp":
            ahora
            + timedelta(
                hours=TOKEN_HORAS
            )

    }


    token = jwt.encode(

        payload,

        JWT_SECRET,

        algorithm=ALGORITHM

    )


    return token


# ==================================================
# VERIFICAR TOKEN
# ==================================================

def verificar_token(
    token: str
):

    try:

        payload = jwt.decode(

            token,

            JWT_SECRET,

            algorithms=[
                ALGORITHM
            ]

        )


        return payload


    except jwt.ExpiredSignatureError:

        # Token correcto pero expiró
        return None


    except jwt.InvalidTokenError:

        # Token manipulado o incorrecto
        return None