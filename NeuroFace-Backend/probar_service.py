import os

from services.reconocimiento_service import reconocer_rostro


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

RUTA_IMAGEN = os.path.join(
    BASE_DIR,
    "base_datos_rostros",
    "Luis_Angel",
    "foto_01.jpg"
)


print("=" * 55)
print("      PRUEBA DEL SERVICIO NEUROFACE")
print("=" * 55)

print(f"\nImagen utilizada:")
print(RUTA_IMAGEN)

print("\nAnalizando rostro...")


resultado = reconocer_rostro(
    RUTA_IMAGEN
)


print("\nRESULTADO:")

print(resultado)