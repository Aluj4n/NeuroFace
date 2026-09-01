from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from auth.jwt_service import verificar_token


# ==================================================
# ESQUEMA DE AUTENTICACIÓN BEARER
# ==================================================

seguridad = HTTPBearer(
    auto_error=False
)


# ==================================================
# OBTENER USUARIO AUTENTICADO
# ==================================================

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(seguridad)
):

    # ----------------------------------------------
    # NO SE ENVIÓ TOKEN
    # ----------------------------------------------

    if credenciales is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes iniciar sesión para acceder.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # ----------------------------------------------
    # OBTENER TOKEN
    # ----------------------------------------------

    token = credenciales.credentials


    # ----------------------------------------------
    # VERIFICAR JWT
    # ----------------------------------------------

    payload = verificar_token(
        token
    )


    if payload is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # ----------------------------------------------
    # OBTENER INFORMACIÓN DEL TOKEN
    # ----------------------------------------------

    usuario = payload.get(
        "sub"
    )

    rol = payload.get(
        "rol"
    )


    if not usuario or not rol:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token no contiene información válida."
        )


    return {
        "usuario": usuario,
        "rol": rol
    }


# ==================================================
# VALIDAR ADMINISTRADOR
# ==================================================

def obtener_admin_actual(
    usuario_actual: dict = Depends(
        obtener_usuario_actual
    )
):

    # ----------------------------------------------
    # SOLO ADMIN
    # ----------------------------------------------

    if (
        usuario_actual["rol"]
        != "admin"
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "No tienes permisos de administrador "
                "para realizar esta acción."
            )
        )


    return usuario_actual