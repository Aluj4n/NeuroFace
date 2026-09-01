import cv2
import numpy as np
from typing import Literal
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from services.reconocimiento_service import reconocer_rostro
from asistencia.registrar_asistencia import (
    registrar_asistencia,
    obtener_resumen_asistencia_usuario
)
from pydantic import BaseModel

from auth.usuarios_db import (
    inicializar_bd,
    autenticar_usuario
)

from auth.jwt_service import crear_token
from pydantic import BaseModel

from auth.usuarios_db import crear_usuario
from auth.dependencias import obtener_admin_actual

from fastapi import Depends

class LoginRequest(BaseModel):
    correo: str
    password: str
class CrearUsuarioRequest(BaseModel):
    usuario: str
    nombre: str
    password: str
    rol: str
# ==================================================
# CREAR APLICACIÓN FASTAPI
# ==================================================

app = FastAPI(
    title="NeuroFace API",
    description="API para reconocimiento facial y asistencia NeuroFace",
    version="1.0.0"
)
inicializar_bd()


# ==================================================
# CORS
# Permite que el frontend React se conecte al backend
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# RUTA PRINCIPAL
# ==================================================

@app.get("/")
def inicio():

    return {
        "mensaje": "API NeuroFace funcionando correctamente",
        "version": "1.0.0"
    }


# ==================================================
# VERIFICAR ESTADO DE LA API
# ==================================================

@app.get("/api/health")
def health():

    return {
        "ok": True,
        "servicio": "NeuroFace API"
    }


# ==================================================
# RECONOCIMIENTO FACIAL
# ==================================================

@app.post("/api/reconocimiento")
async def reconocimiento(
    archivo: UploadFile = File(...)
):

    # ----------------------------------------------
    # 1. VALIDAR TIPO DE ARCHIVO
    # ----------------------------------------------

    if archivo.content_type not in [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]:

        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser una imagen JPG o PNG."
        )


    # ----------------------------------------------
    # 2. LEER IMAGEN
    # ----------------------------------------------

    contenido = await archivo.read()


    # ----------------------------------------------
    # 3. CONVERTIR BYTES A NUMPY
    # ----------------------------------------------

    np_array = np.frombuffer(
        contenido,
        np.uint8
    )


    # ----------------------------------------------
    # 4. CONVERTIR A IMAGEN OPENCV
    # ----------------------------------------------

    imagen = cv2.imdecode(
        np_array,
        cv2.IMREAD_COLOR
    )


    if imagen is None:

        raise HTTPException(
            status_code=400,
            detail="No se pudo procesar la imagen."
        )


    # ----------------------------------------------
    # 5. ENVIAR IMAGEN AL MOTOR IA
    # ----------------------------------------------

    resultado = reconocer_rostro(
        imagen
    )


    # ----------------------------------------------
    # 6. DEVOLVER RESULTADO
    # ----------------------------------------------

    return resultado
# ==================================================
# REGISTRAR ASISTENCIA CON RECONOCIMIENTO FACIAL
# ==================================================

@app.post("/api/asistencia/registrar")
async def registrar_asistencia_facial(
    tipo: Literal["entrada", "salida"] = Form(...),
    archivo: UploadFile = File(...)
):

    # ----------------------------------------------
    # VALIDAR TIPO
    # ----------------------------------------------

    tipo = tipo.lower().strip()

    if tipo not in ["entrada", "salida"]:
        raise HTTPException(
            status_code=400,
            detail="El tipo debe ser entrada o salida."
        )


    # ----------------------------------------------
    # VALIDAR IMAGEN
    # ----------------------------------------------

    if archivo.content_type not in [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]:
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser JPG o PNG."
        )


    # ----------------------------------------------
    # LEER IMAGEN
    # ----------------------------------------------

    contenido = await archivo.read()

    np_array = np.frombuffer(
        contenido,
        np.uint8
    )

    imagen = cv2.imdecode(
        np_array,
        cv2.IMREAD_COLOR
    )


    if imagen is None:
        raise HTTPException(
            status_code=400,
            detail="No se pudo procesar la imagen."
        )


    # ----------------------------------------------
    # RECONOCER ROSTRO
    # ----------------------------------------------

    resultado_rostro = reconocer_rostro(
        imagen
    )


    if not resultado_rostro.get(
        "reconocido",
        False
    ):

        return {
            "ok": False,
            "reconocido": False,
            "mensaje": "Rostro no reconocido.",
            "usuario": resultado_rostro.get(
                "usuario",
                "Desconocido"
            ),
            "score": resultado_rostro.get(
                "score",
                0
            )
        }


    # ----------------------------------------------
    # DATOS DEL ROSTRO
    # ----------------------------------------------

    usuario = resultado_rostro["usuario"]

    score = resultado_rostro["score"]

    emocion = resultado_rostro.get(
        "emocion",
        "No detectada"
    )


    # ----------------------------------------------
    # REGISTRAR ASISTENCIA
    # ----------------------------------------------

    resultado_asistencia = registrar_asistencia(
        usuario=usuario,
        tipo=tipo,
        emocion=emocion,
        score=score
    )


    return {
        **resultado_asistencia,
        "reconocido": True
    }
# ==================================================
# OBTENER ASISTENCIAS DEL USUARIO
# ==================================================

@app.get("/api/asistencia/{usuario}")
def obtener_asistencia_usuario(usuario: str):

    resultado = obtener_resumen_asistencia_usuario(
        usuario
    )

    return resultado# ==================================================
# LOGIN NEUROFACE
# ==================================================

@app.post("/api/auth/login")
def login(datos: LoginRequest):

    correo = datos.correo.strip().lower()
    password = datos.password


    # ----------------------------------------------
    # VALIDAR CAMPOS
    # ----------------------------------------------

    if not correo:

        raise HTTPException(
            status_code=400,
            detail="El correo es obligatorio."
        )


    if not password:

        raise HTTPException(
            status_code=400,
            detail="La contraseña es obligatoria."
        )


    # ----------------------------------------------
    # BUSCAR USUARIO EN SQLITE
    # ----------------------------------------------

    usuario = autenticar_usuario(
        correo=correo,
        password=password
    )


    if not usuario:

        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos."
        )


    # ----------------------------------------------
    # CREAR TOKEN JWT
    # ----------------------------------------------

    token = crear_token(
        usuario=usuario["usuario"],
        rol=usuario["rol"]
    )


    # ----------------------------------------------
    # RESPUESTA
    # ----------------------------------------------

    return {

        "ok": True,

        "mensaje":
            "Inicio de sesión correcto.",

        "token": token,

        "token_type": "bearer",

        "usuario": {

            "id": usuario["id"],

            "usuario":
                usuario["usuario"],

            "correo":
                usuario["correo"],

            "nombre":
                usuario["nombre"],

            "rol":
                usuario["rol"]

        }

    }
# ==================================================
# ADMIN - CREAR USUARIO / ADMINISTRADOR
# ==================================================

@app.post("/api/admin/usuarios")
def crear_cuenta_desde_admin(
    datos: CrearUsuarioRequest,
    admin_actual: dict = Depends(obtener_admin_actual)
):

    usuario = datos.usuario.strip()
    nombre = datos.nombre.strip()
    password = datos.password
    rol = datos.rol.strip().lower()


    # ==============================================
    # VALIDACIONES
    # ==============================================

    if not usuario:

        raise HTTPException(
            status_code=400,
            detail="El usuario es obligatorio."
        )


    if not nombre:

        raise HTTPException(
            status_code=400,
            detail="El nombre es obligatorio."
        )


    if len(password) < 8:

        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener mínimo 8 caracteres."
        )


    if rol not in [
        "usuario",
        "admin"
    ]:

        raise HTTPException(
            status_code=400,
            detail="El rol debe ser usuario o admin."
        )


    # ==============================================
    # CREAR CUENTA
    # ==============================================

    resultado = crear_usuario(
        usuario=usuario,
        nombre=nombre,
        password=password,
        rol=rol
    )


    if not resultado["ok"]:

        raise HTTPException(
            status_code=400,
            detail=resultado["mensaje"]
        )


    # ==============================================
    # RESPUESTA
    # ==============================================

    return {

        "ok": True,

        "mensaje":
            "Cuenta creada correctamente.",

        "cuenta": {

            "usuario":
                resultado["usuario"],

            "correo":
                resultado["correo"],

            "nombre":
                resultado["nombre"],

            "rol":
                resultado["rol"]

        },

        "creado_por": {

            "usuario":
                admin_actual["usuario"],

            "rol":
                admin_actual["rol"]

        }

    }
