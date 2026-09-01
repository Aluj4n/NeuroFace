from deepface import DeepFace
import pandas as pd
import os


# Ruta principal del backend
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

# Carpetas del proyecto
CARPETA_ROSTROS = os.path.join(
    BASE_DIR,
    "base_datos_rostros"
)

CARPETA_DATASETS = os.path.join(
    BASE_DIR,
    "datasets"
)

# Archivo que vamos a generar
ARCHIVO_CSV = os.path.join(
    CARPETA_DATASETS,
    "embeddings.csv"
)

# Extensiones de imágenes permitidas
EXTENSIONES_VALIDAS = (
    ".jpg",
    ".jpeg",
    ".png"
)

# Aquí almacenaremos todos los registros
datos = []


print("=" * 50)
print("       GENERADOR DE EMBEDDINGS - NEUROFACE")
print("=" * 50)


# Recorrer cada persona registrada
for persona in os.listdir(CARPETA_ROSTROS):

    ruta_persona = os.path.join(
        CARPETA_ROSTROS,
        persona
    )

    # Ignorar archivos sueltos como el .pkl de DeepFace
    if not os.path.isdir(ruta_persona):
        continue

    print(f"\nProcesando persona: {persona}")

    # Recorrer las fotografías
    for imagen in os.listdir(ruta_persona):

        if not imagen.lower().endswith(EXTENSIONES_VALIDAS):
            continue

        ruta_imagen = os.path.join(
            ruta_persona,
            imagen
        )

        print(f"  -> {imagen}")

        try:

            # Convertir el rostro a un vector de 512 características
            resultado = DeepFace.represent(
                img_path=ruta_imagen,
                model_name="Facenet512",
                detector_backend="mtcnn",
                enforce_detection=True,
                align=True
            )

            # Extraer embedding
            embedding = resultado[0]["embedding"]

            # Verificar tamaño esperado
            if len(embedding) != 512:
                print(
                    f"     Advertencia: se obtuvieron "
                    f"{len(embedding)} características."
                )
                continue

            # Datos básicos de la fotografía
            fila = {
                "persona": persona,
                "imagen": imagen
            }

            # Guardar las 512 características
            for indice, valor in enumerate(embedding):
                fila[f"f{indice + 1}"] = valor

            datos.append(fila)

            print("     OK - 512 características extraídas")

        except Exception as error:

            print(f"     ERROR - {error}")


# Crear carpeta datasets si no existe
os.makedirs(
    CARPETA_DATASETS,
    exist_ok=True
)


# Generar CSV
if len(datos) > 0:

    dataframe = pd.DataFrame(datos)

    dataframe.to_csv(
        ARCHIVO_CSV,
        index=False,
        encoding="utf-8"
    )

    print("\n" + "=" * 50)
    print("        DATASET GENERADO CORRECTAMENTE")
    print("=" * 50)

    print(f"Fotografías procesadas: {len(dataframe)}")
    print("Características por rostro: 512")
    print(f"Archivo generado: {ARCHIVO_CSV}")

else:

    print("\nNo se pudo procesar ninguna fotografía.")