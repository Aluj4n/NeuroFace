import os
import csv
from datetime import datetime


# ==================================================
# RUTAS
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

RUTA_ASISTENCIAS = os.path.join(
    BASE_DIR,
    "datasets",
    "asistencias.csv"
)


# ==================================================
# OBTENER REGISTROS DEL DÍA
# ==================================================

def obtener_asistencias_usuario(usuario, fecha):

    registros = []

    if not os.path.exists(RUTA_ASISTENCIAS):
        return registros

    with open(
        RUTA_ASISTENCIAS,
        mode="r",
        newline="",
        encoding="utf-8"
    ) as archivo:

        lector = csv.DictReader(archivo)

        for fila in lector:

            if (
                fila["usuario"] == usuario
                and fila["fecha"] == fecha
            ):
                registros.append(fila)

    return registros


# ==================================================
# REGISTRAR ASISTENCIA
# ==================================================

def registrar_asistencia(
    usuario,
    tipo,
    emocion,
    score
):

    tipo = tipo.lower()

    if tipo not in ["entrada", "salida"]:

        print("\nERROR: Tipo de asistencia inválido.")

        return {
            "ok": False,
            "mensaje": "Tipo de asistencia inválido."
        }


    ahora = datetime.now()

    fecha = ahora.strftime("%Y-%m-%d")
    hora = ahora.strftime("%H:%M:%S")


    # ==================================================
    # CONSULTAR REGISTROS DE HOY
    # ==================================================

    registros_hoy = obtener_asistencias_usuario(
        usuario,
        fecha
    )


    tiene_entrada = any(
        registro["tipo"] == "entrada"
        for registro in registros_hoy
    )


    tiene_salida = any(
        registro["tipo"] == "salida"
        for registro in registros_hoy
    )


    # ==================================================
    # REGLA PARA ENTRADA
    # ==================================================

    if tipo == "entrada":

        if tiene_entrada:

            mensaje = (
                f"{usuario} ya registró "
                f"su entrada hoy."
            )

            print(f"\n{mensaje}")

            return {
                "ok": False,
                "mensaje": mensaje
            }


    # ==================================================
    # REGLA PARA SALIDA
    # ==================================================

    if tipo == "salida":

        if not tiene_entrada:

            mensaje = (
                "No puedes registrar salida "
                "sin haber registrado entrada."
            )

            print(f"\n{mensaje}")

            return {
                "ok": False,
                "mensaje": mensaje
            }


        if tiene_salida:

            mensaje = (
                f"{usuario} ya registró "
                f"su salida hoy."
            )

            print(f"\n{mensaje}")

            return {
                "ok": False,
                "mensaje": mensaje
            }


    # ==================================================
    # GUARDAR REGISTRO
    # ==================================================

    archivo_existe = os.path.exists(
        RUTA_ASISTENCIAS
    )


    with open(
        RUTA_ASISTENCIAS,
        mode="a",
        newline="",
        encoding="utf-8"
    ) as archivo:

        escritor = csv.writer(archivo)


        if not archivo_existe:

            escritor.writerow([
                "usuario",
                "fecha",
                "hora",
                "tipo",
                "emocion",
                "score"
            ])


        escritor.writerow([
            usuario,
            fecha,
            hora,
            tipo,
            emocion,
            round(score, 2)
        ])


    # ==================================================
    # RESULTADO
    # ==================================================

    mensaje = (
        f"{tipo.capitalize()} registrada "
        f"correctamente."
    )


    print("\n" + "=" * 45)
    print("       ASISTENCIA REGISTRADA")
    print("=" * 45)

    print(f"Usuario : {usuario}")
    print(f"Tipo    : {tipo}")
    print(f"Fecha   : {fecha}")
    print(f"Hora    : {hora}")
    print(f"Emoción : {emocion}")
    print(f"Score   : {score:.2f}%")

    print("=" * 45)


    return {
        "ok": True,
        "mensaje": mensaje,
        "usuario": usuario,
        "tipo": tipo,
        "fecha": fecha,
        "hora": hora,
        "emocion": emocion,
        "score": round(score, 2)
    }
# ==================================================
# OBTENER RESUMEN E HISTORIAL DE UN USUARIO
# ==================================================

def obtener_resumen_asistencia_usuario(usuario):

    fecha_actual = datetime.now().strftime("%Y-%m-%d")

    registros_usuario = []


    # ----------------------------------------------
    # SI TODAVÍA NO EXISTE EL CSV
    # ----------------------------------------------

    if not os.path.exists(RUTA_ASISTENCIAS):

        return {
            "usuario": usuario,
            "hoy": {
                "entrada": None,
                "salida": None,
                "estado": "Sin registrar"
            },
            "historial": []
        }


    # ----------------------------------------------
    # LEER REGISTROS DEL USUARIO
    # ----------------------------------------------

    with open(
        RUTA_ASISTENCIAS,
        "r",
        encoding="utf-8",
        newline=""
    ) as archivo:

        lector = csv.DictReader(archivo)


        for fila in lector:

            if fila["usuario"] == usuario:
                registros_usuario.append(fila)


    # ----------------------------------------------
    # AGRUPAR POR FECHA
    # ----------------------------------------------

    asistencias_por_fecha = {}


    for registro in registros_usuario:

        fecha = registro["fecha"]
        tipo = registro["tipo"].lower()


        if fecha not in asistencias_por_fecha:

            asistencias_por_fecha[fecha] = {
                "fecha": fecha,
                "entrada": None,
                "salida": None
            }


        if tipo == "entrada":

            asistencias_por_fecha[fecha][
                "entrada"
            ] = registro["hora"]


        elif tipo == "salida":

            asistencias_por_fecha[fecha][
                "salida"
            ] = registro["hora"]


    # ----------------------------------------------
    # ESTADO DE HOY
    # ----------------------------------------------

    registro_hoy = asistencias_por_fecha.get(
        fecha_actual,
        {
            "entrada": None,
            "salida": None
        }
    )


    entrada_hoy = registro_hoy.get("entrada")
    salida_hoy = registro_hoy.get("salida")


    if entrada_hoy and salida_hoy:

        estado = "Jornada completada"

    elif entrada_hoy:

        estado = "Entrada registrada"

    else:

        estado = "Sin registrar"


    # ----------------------------------------------
    # HISTORIAL
    # ----------------------------------------------

    historial = list(
        asistencias_por_fecha.values()
    )


    historial.sort(
        key=lambda registro: registro["fecha"],
        reverse=True
    )


    return {
        "usuario": usuario,

        "hoy": {
            "entrada": entrada_hoy,
            "salida": salida_hoy,
            "estado": estado
        },

        "historial": historial
    }