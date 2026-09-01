import cv2
import joblib
import os
import numpy as np
import sys
import time
from deepface import DeepFace


# ==================================================
# RUTAS DEL PROYECTO
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)
# Permitir importar módulos desde la raíz del backend
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from asistencia.registrar_asistencia import registrar_asistencia

RUTA_MODELO = os.path.join(
    BASE_DIR,
    "modelos_ml",
    "modelo_svm.pkl"
)


# ==================================================
# COMPROBAR Y CARGAR MODELO SVM
# ==================================================

if not os.path.exists(RUTA_MODELO):
    print("ERROR: No existe modelo_svm.pkl")
    print("Primero ejecuta entrenar_modelo.py")
    exit()


modelo = joblib.load(RUTA_MODELO)


print("=" * 55)
print("       NEUROFACE - RECONOCIMIENTO SVM")
print("=" * 55)

print("\nModelo cargado correctamente.")
print(f"Personas conocidas: {list(modelo.classes_)}")
print("\nPresiona Q para salir.")


# ==================================================
# TRADUCCIÓN DE EMOCIONES
# ==================================================

TRADUCCION_EMOCIONES = {
    "happy": "Feliz",
    "sad": "Triste",
    "angry": "Enojado",
    "surprise": "Sorprendido",
    "fear": "Miedo",
    "disgust": "Disgusto",
    "neutral": "Neutral"
}


# ==================================================
# CONFIGURACIÓN
# ==================================================

UMBRAL = 0.70

# Reconocimiento facial cada 30 frames
PROCESS_EVERY_N_FRAMES = 30

# Emoción cada 90 frames
PROCESS_EMOTION_EVERY_N_FRAMES = 90

# Necesitamos 3 reconocimientos consecutivos
RECONOCIMIENTOS_REQUERIDOS = 3


# ==================================================
# VARIABLES
# ==================================================

usuario_actual = "Buscando..."
score_actual = 0.0
emocion_actual = "Buscando..."
ultimo_registro = 0
COOLDOWN_REGISTRO = 2

frame_count = 0

usuario_candidato = None
contador_validaciones = 0

identidad_validada = False
estado_validacion = "Esperando rostro"


# ==================================================
# ABRIR CÁMARA
# ==================================================

cap = cv2.VideoCapture(0)

# Reducir resolución para mejorar rendimiento
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)


if not cap.isOpened():
    print("ERROR: No se pudo abrir la cámara.")
    exit()


# ==================================================
# BUCLE PRINCIPAL
# ==================================================
def obtener_emocion_actual(frame):

    try:

        analisis_emocion = DeepFace.analyze(
            img_path=frame,
            actions=["emotion"],
            detector_backend="mtcnn",
            enforce_detection=True
        )

        if isinstance(analisis_emocion, list):
            analisis_emocion = analisis_emocion[0]

        emocion_ingles = analisis_emocion.get(
            "dominant_emotion",
            "neutral"
        )

        return TRADUCCION_EMOCIONES.get(
            emocion_ingles,
            emocion_ingles
        )

    except Exception:

        return "No detectada"
while True:

    ret, frame = cap.read()

    if not ret:
        print("ERROR: No se pudo obtener imagen de la cámara.")
        break

    frame_count += 1


    # ==================================================
    # RECONOCIMIENTO FACIAL
    # ==================================================

    if frame_count % PROCESS_EVERY_N_FRAMES == 0:

        try:

            # ------------------------------------------
            # 1. EXTRAER EMBEDDING
            # ------------------------------------------

            representacion = DeepFace.represent(
                img_path=frame,
                model_name="Facenet512",
                detector_backend="mtcnn",
                enforce_detection=True,
                align=True
            )

            embedding = representacion[0]["embedding"]

            embedding_array = np.array(
                embedding
            ).reshape(1, -1)


            # ------------------------------------------
            # 2. CLASIFICAR CON SVM
            # ------------------------------------------

            prediccion = modelo.predict(
                embedding_array
            )[0]

            probabilidades = modelo.predict_proba(
                embedding_array
            )[0]

            mayor_indice = np.argmax(
                probabilidades
            )

            probabilidad = probabilidades[
                mayor_indice
            ]

            score_actual = probabilidad * 100


            # ------------------------------------------
            # 3. VALIDAR UMBRAL
            # ------------------------------------------

            if probabilidad >= UMBRAL:

                # Sigue detectando a la misma persona
                if prediccion == usuario_candidato:
                    contador_validaciones += 1

                else:
                    # Nueva persona candidata
                    usuario_candidato = prediccion
                    contador_validaciones = 1


                # Verificar si llegó a 3 detecciones
                if contador_validaciones >= RECONOCIMIENTOS_REQUERIDOS:

                    usuario_actual = prediccion
                    identidad_validada = True

                    estado_validacion = "IDENTIDAD VALIDADA"

                else:

                    usuario_actual = prediccion
                    identidad_validada = False

                    estado_validacion = (
                        f"Validando "
                        f"{contador_validaciones}/"
                        f"{RECONOCIMIENTOS_REQUERIDOS}"
                    )

            else:

                usuario_actual = "Desconocido"
                identidad_validada = False

                estado_validacion = "NO VALIDADO"

                usuario_candidato = None
                contador_validaciones = 0


            # ------------------------------------------
            # 4. ANALIZAR EMOCIÓN
            # ------------------------------------------

            if (
                identidad_validada
                and frame_count
                % PROCESS_EMOTION_EVERY_N_FRAMES
                == 0
            ):

                analisis_emocion = DeepFace.analyze(
                    img_path=frame,
                    actions=["emotion"],
                    detector_backend="mtcnn",
                    enforce_detection=True
                )

                if isinstance(analisis_emocion, list):
                    analisis_emocion = analisis_emocion[0]

                emocion_ingles = analisis_emocion.get(
                    "dominant_emotion",
                    "neutral"
                )

                emocion_actual = TRADUCCION_EMOCIONES.get(
                    emocion_ingles,
                    emocion_ingles
                )


        except Exception:

            usuario_actual = "Sin rostro"
            score_actual = 0.0

            identidad_validada = False
            estado_validacion = "Esperando rostro"

            usuario_candidato = None
            contador_validaciones = 0


            


    # ==================================================
    # MOSTRAR INFORMACIÓN
    # ==================================================

    cv2.putText(
        frame,
        f"Usuario: {usuario_actual}",
        (30, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Score: {score_actual:.2f}%",
        (30, 90),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Emocion: {emocion_actual}",
        (30, 130),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 200, 255),
        2
    )

    cv2.putText(
        frame,
        f"Estado: {estado_validacion}",
        (30, 170),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )
    cv2.putText(
    frame,
    "E: Entrada | S: Salida | Q: Salir",
    (30, 210),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (255, 255, 255),
    2
)


    # ==================================================
    # MOSTRAR VENTANA
    # ==================================================

    cv2.imshow(
        "NeuroFace - SVM + Emociones",
        frame
    )

    tecla = cv2.waitKey(1) & 0xFF


    # ==================================================
    # REGISTRAR ENTRADA
    # ==================================================

    if tecla == ord("e"):

        tiempo_actual = time.time()

        if tiempo_actual - ultimo_registro < COOLDOWN_REGISTRO:
            continue

        ultimo_registro = tiempo_actual

        if identidad_validada:

            # Obtener emoción justo al registrar
            emocion_registro = obtener_emocion_actual(frame)

            resultado = registrar_asistencia(
                usuario=usuario_actual,
                tipo="entrada",
                emocion=emocion_registro,
                score=score_actual
            )

            emocion_actual = emocion_registro
            estado_validacion = resultado["mensaje"]

        else:

            estado_validacion = "Identidad no validada"

    # ==================================================
    # REGISTRAR SALIDA
    # ==================================================

    elif tecla == ord("s"):

        tiempo_actual = time.time()

        if tiempo_actual - ultimo_registro < COOLDOWN_REGISTRO:
            continue

        ultimo_registro = tiempo_actual

        if identidad_validada:

            # Obtener emoción justo al registrar
            emocion_registro = obtener_emocion_actual(frame)

            resultado = registrar_asistencia(
                usuario=usuario_actual,
                tipo="salida",
                emocion=emocion_registro,
                score=score_actual
            )

            emocion_actual = emocion_registro
            estado_validacion = resultado["mensaje"]

        else:

            estado_validacion = "Identidad no validada"


    # ==================================================
    # SALIR
    # ==================================================

    elif tecla == ord("q"):
        break


# ==================================================
# LIBERAR RECURSOS
# ==================================================

cap.release()
cv2.destroyAllWindows()