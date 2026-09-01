import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ==================================================
# RUTAS DEL PROYECTO
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

RUTA_DATASET = os.path.join(
    BASE_DIR,
    "datasets",
    "embeddings.csv"
)

CARPETA_MODELOS = os.path.join(
    BASE_DIR,
    "modelos_ml"
)

RUTA_MODELO = os.path.join(
    CARPETA_MODELOS,
    "modelo_svm.pkl"
)


print("=" * 55)
print("       ENTRENAMIENTO SVM - NEUROFACE")
print("=" * 55)


# ==================================================
# 1. CARGAR DATASET
# ==================================================

if not os.path.exists(RUTA_DATASET):
    print("\nERROR: No existe embeddings.csv")
    print("Primero ejecuta generar_embeddings.py")
    exit()


df = pd.read_csv(RUTA_DATASET)

print(f"\nRegistros encontrados: {len(df)}")


# ==================================================
# 2. VER CANTIDAD DE FOTOS POR PERSONA
# ==================================================

conteo = df["persona"].value_counts()

print("\nFotografías por persona:")

for persona, cantidad in conteo.items():
    print(f"  {persona}: {cantidad}")


# ==================================================
# 3. FILTRAR PERSONAS CON MUY POCAS FOTOS
# ==================================================

MINIMO_FOTOS = 3

personas_validas = conteo[
    conteo >= MINIMO_FOTOS
].index


df_filtrado = df[
    df["persona"].isin(personas_validas)
].copy()


personas_excluidas = conteo[
    conteo < MINIMO_FOTOS
].index


if len(personas_excluidas) > 0:

    print("\nPersonas temporalmente excluidas:")

    for persona in personas_excluidas:

        print(
            f"  {persona} "
            f"({conteo[persona]} foto/s)"
        )


# ==================================================
# 4. COMPROBAR QUE EXISTAN AL MENOS DOS PERSONAS
# ==================================================

if df_filtrado["persona"].nunique() < 2:

    print("\nERROR:")
    print(
        "Se necesitan al menos 2 personas "
        "con 3 fotografías cada una."
    )

    exit()


# ==================================================
# 5. SEPARAR X E Y
# ==================================================

columnas_embedding = [
    columna
    for columna in df_filtrado.columns
    if columna.startswith("f")
]


X = df_filtrado[columnas_embedding]

y = df_filtrado["persona"]


print(
    f"\nCaracterísticas utilizadas: "
    f"{len(columnas_embedding)}"
)

print(
    f"Personas utilizadas: "
    f"{y.nunique()}"
)


# ==================================================
# 6. DIVIDIR 80% ENTRENAMIENTO / 20% PRUEBA
# ==================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nDivisión del dataset:")

print(
    f"  Entrenamiento: {len(X_train)} registros"
)

print(
    f"  Prueba:        {len(X_test)} registros"
)


# ==================================================
# 7. CREAR MODELO
# ==================================================

modelo_evaluacion = Pipeline([
    (
        "escalador",
        StandardScaler()
    ),

    (
        "svm",
        SVC(
            kernel="linear",
            probability=True,
            class_weight="balanced",
            random_state=42
        )
    )
])


# ==================================================
# 8. ENTRENAR
# ==================================================

print("\nEntrenando modelo SVM...")

modelo_evaluacion.fit(
    X_train,
    y_train
)

print("Modelo entrenado.")


# ==================================================
# 9. REALIZAR PREDICCIONES
# ==================================================

predicciones = modelo_evaluacion.predict(
    X_test
)


# ==================================================
# 10. EVALUACIÓN
# ==================================================

accuracy = accuracy_score(
    y_test,
    predicciones
)

print("\n" + "=" * 55)
print("             RESULTADOS")
print("=" * 55)

print(
    f"\nAccuracy: {accuracy * 100:.2f}%"
)


print("\nReporte de clasificación:")

print(
    classification_report(
        y_test,
        predicciones,
        zero_division=0
    )
)


print("Matriz de confusión:")

print(
    confusion_matrix(
        y_test,
        predicciones
    )
)


# ==================================================
# 11. ENTRENAR MODELO FINAL CON TODOS LOS DATOS
# ==================================================

print("\nEntrenando modelo final...")

modelo_final = Pipeline([
    (
        "escalador",
        StandardScaler()
    ),

    (
        "svm",
        SVC(
            kernel="linear",
            probability=True,
            class_weight="balanced",
            random_state=42
        )
    )
])


modelo_final.fit(
    X,
    y
)


# ==================================================
# 12. GUARDAR MODELO
# ==================================================

os.makedirs(
    CARPETA_MODELOS,
    exist_ok=True
)


joblib.dump(
    modelo_final,
    RUTA_MODELO
)


print("\n" + "=" * 55)
print("       MODELO GUARDADO CORRECTAMENTE")
print("=" * 55)

print(
    f"\nModelo: {RUTA_MODELO}"
)

print(
    f"Clases aprendidas: "
    f"{list(modelo_final.classes_)}"
)