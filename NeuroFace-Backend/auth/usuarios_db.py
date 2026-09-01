import os
import sqlite3
import bcrypt


# ==================================================
# RUTAS
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATABASE_DIR = os.path.join(
    BASE_DIR,
    "database"
)

os.makedirs(
    DATABASE_DIR,
    exist_ok=True
)

DB_PATH = os.path.join(
    DATABASE_DIR,
    "neuroface.db"
)


# ==================================================
# CONECTAR A SQLITE
# ==================================================

def conectar():

    conexion = sqlite3.connect(
        DB_PATH
    )

    conexion.row_factory = sqlite3.Row

    return conexion


# ==================================================
# GENERAR CORREO NEUROFACE
# ==================================================

def generar_correo(usuario: str):

    usuario_limpio = (
        usuario
        .strip()
        .lower()
        .replace(" ", "_")
    )

    return f"{usuario_limpio}@neuroface.com"


# ==================================================
# INICIALIZAR BASE DE DATOS
# ==================================================

def inicializar_bd():

    conexion = conectar()

    cursor = conexion.cursor()


    # ----------------------------------------------
    # CREAR TABLA SI NO EXISTE
    # ----------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            usuario TEXT UNIQUE NOT NULL,

            correo TEXT UNIQUE NOT NULL,

            nombre TEXT NOT NULL,

            password_hash TEXT NOT NULL,

            rol TEXT NOT NULL,

            activo INTEGER NOT NULL DEFAULT 1

        )
        """
    )


    conexion.commit()


    # ----------------------------------------------
    # COMPROBAR ESTRUCTURA
    # Esto ayuda si tenías una BD anterior sin correo
    # ----------------------------------------------

    cursor.execute(
        "PRAGMA table_info(usuarios)"
    )

    columnas = [
        fila["name"]
        for fila in cursor.fetchall()
    ]


    if "correo" not in columnas:

        print(
            "Actualizando base de datos: "
            "agregando columna correo..."
        )


        cursor.execute(
            """
            ALTER TABLE usuarios
            ADD COLUMN correo TEXT
            """
        )


        conexion.commit()


        # ------------------------------------------
        # CREAR CORREOS PARA USUARIOS ANTIGUOS
        # ------------------------------------------

        cursor.execute(
            """
            SELECT id, usuario
            FROM usuarios
            """
        )


        usuarios_antiguos = cursor.fetchall()


        for fila in usuarios_antiguos:

            correo = generar_correo(
                fila["usuario"]
            )


            cursor.execute(
                """
                UPDATE usuarios
                SET correo = ?
                WHERE id = ?
                """,
                (
                    correo,
                    fila["id"]
                )
            )


        conexion.commit()


    # ----------------------------------------------
    # ÍNDICE ÚNICO PARA CORREO
    # ----------------------------------------------

    cursor.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS
        idx_usuarios_correo
        ON usuarios(correo)
        """
    )


    conexion.commit()

    conexion.close()


# ==================================================
# CREAR USUARIO
# ==================================================

def crear_usuario(
    usuario: str,
    nombre: str,
    password: str,
    rol: str
):

    usuario = usuario.strip()
    nombre = nombre.strip()
    rol = rol.strip().lower()


    # ----------------------------------------------
    # VALIDACIONES
    # ----------------------------------------------

    if not usuario:

        return {
            "ok": False,
            "mensaje": "El usuario es obligatorio."
        }


    if not nombre:

        return {
            "ok": False,
            "mensaje": "El nombre es obligatorio."
        }


    if rol not in [
        "usuario",
        "admin"
    ]:

        return {
            "ok": False,
            "mensaje":
                "El rol debe ser usuario o admin."
        }


    if not password:

        return {
            "ok": False,
            "mensaje":
                "La contraseña es obligatoria."
        }


    if len(password) < 8:

        return {
            "ok": False,
            "mensaje":
                "La contraseña debe tener mínimo "
                "8 caracteres."
        }


    # ----------------------------------------------
    # GENERAR CORREO AUTOMÁTICAMENTE
    # ----------------------------------------------

    correo = generar_correo(
        usuario
    )


    # ----------------------------------------------
    # HASH DE CONTRASEÑA
    # ----------------------------------------------

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    conexion = conectar()

    cursor = conexion.cursor()


    try:

        cursor.execute(
            """
            INSERT INTO usuarios (
                usuario,
                correo,
                nombre,
                password_hash,
                rol,
                activo
            )
            VALUES (?, ?, ?, ?, ?, 1)
            """,
            (
                usuario,
                correo,
                nombre,
                password_hash,
                rol
            )
        )


        conexion.commit()


        return {
            "ok": True,

            "mensaje":
                "Usuario creado correctamente.",

            "usuario": usuario,

            "correo": correo,

            "nombre": nombre,

            "rol": rol
        }


    except sqlite3.IntegrityError:

        return {
            "ok": False,
            "mensaje":
                "El usuario o correo ya existe."
        }


    finally:

        conexion.close()


# ==================================================
# AUTENTICAR USUARIO POR CORREO
# ==================================================

def autenticar_usuario(
    correo: str,
    password: str
):

    correo = correo.strip().lower()


    conexion = conectar()

    cursor = conexion.cursor()


    cursor.execute(
        """
        SELECT
            id,
            usuario,
            correo,
            nombre,
            password_hash,
            rol,
            activo

        FROM usuarios

        WHERE correo = ?
        """,
        (
            correo,
        )
    )


    fila = cursor.fetchone()

    conexion.close()


    # ----------------------------------------------
    # USUARIO NO EXISTE
    # ----------------------------------------------

    if not fila:
        return None


    # ----------------------------------------------
    # USUARIO DESACTIVADO
    # ----------------------------------------------

    if not fila["activo"]:
        return None


    # ----------------------------------------------
    # VALIDAR CONTRASEÑA
    # ----------------------------------------------

    password_correcta = bcrypt.checkpw(
        password.encode("utf-8"),
        fila["password_hash"].encode("utf-8")
    )


    if not password_correcta:
        return None


    # ----------------------------------------------
    # DATOS DEL USUARIO
    # ----------------------------------------------

    return {
        "id": fila["id"],
        "usuario": fila["usuario"],
        "correo": fila["correo"],
        "nombre": fila["nombre"],
        "rol": fila["rol"]
    }


# ==================================================
# BUSCAR USUARIO POR CORREO
# ==================================================

def obtener_usuario_por_correo(
    correo: str
):

    conexion = conectar()

    cursor = conexion.cursor()


    cursor.execute(
        """
        SELECT
            id,
            usuario,
            correo,
            nombre,
            rol,
            activo

        FROM usuarios

        WHERE correo = ?
        """,
        (
            correo.strip().lower(),
        )
    )


    fila = cursor.fetchone()

    conexion.close()


    if not fila:
        return None


    return {
        "id": fila["id"],
        "usuario": fila["usuario"],
        "correo": fila["correo"],
        "nombre": fila["nombre"],
        "rol": fila["rol"],
        "activo": bool(
            fila["activo"]
        )
    }