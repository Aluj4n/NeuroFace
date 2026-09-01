import os
import joblib
import numpy as np

from deepface import DeepFace


# ==================================================
# RUTAS DEL PROYECTO
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

RUTA_MODELO = os.path.join(
    BASE_DIR,
    "modelos_ml",
    "modelo_svm.pkl"
)


# ==================================================
# CONFIGURACIÓN
# ==================================================

UMBRAL = 0.70


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
# CARGAR MODELO
# ==================================================

if not os.path.exists(RUTA_MODELO):

    raise FileNotFoundError(
        "No existe modelo_svm.pkl. "
        "Primero ejecuta entrenar_modelo.py."
    )


modelo = joblib.load(RUTA_MODELO)


# ==================================================
# FUNCIÓN PRINCIPAL
# ==================================================

def reconocer_rostro(imagen):

    try:

        # ------------------------------------------
        # 1. EXTRAER EMBEDDING
        # ------------------------------------------

        representacion = DeepFace.represent(
            img_path=imagen,
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

        indice_mayor = np.argmax(
            probabilidades
        )

        probabilidad = probabilidades[
            indice_mayor
        ]

        score = float(probabilidad * 100)


        # ------------------------------------------
        # 3. VALIDAR UMBRAL
        # ------------------------------------------

        if probabilidad < UMBRAL:

            return {
                "reconocido": False,
                "usuario": "Desconocido",
                "score": round(score, 2),
                "emocion": None
            }


        # ------------------------------------------
        # 4. ANALIZAR EMOCIÓN
        # ------------------------------------------

        analisis = DeepFace.analyze(
            img_path=imagen,
            actions=["emotion"],
            detector_backend="mtcnn",
            enforce_detection=True
        )


        if isinstance(analisis, list):
            analisis = analisis[0]


        emocion_ingles = analisis.get(
            "dominant_emotion",
            "neutral"
        )


        emocion = TRADUCCION_EMOCIONES.get(
            emocion_ingles,
            emocion_ingles
        )


        # ------------------------------------------
        # 5. RESPUESTA FINAL
        # ------------------------------------------

        return {
            "reconocido": True,
            "usuario": prediccion,
            "score": round(score, 2),
            "emocion": emocion
        }


    except Exception:

        return {
            "reconocido": False,
            "usuario": None,
            "score": 0.0,
            "emocion": None,
            "error": "No se pudo detectar un rostro."
        }