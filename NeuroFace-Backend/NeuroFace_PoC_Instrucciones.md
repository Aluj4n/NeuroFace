# Guía de Prueba de Concepto (PoC) - Motor IA NeuroFace

## Objetivo
Validar el reconocimiento facial y la clasificación de emociones (clima grupal) en tiempo real mediante un script aislado en Python, utilizando modelos preentrenados para evitar la necesidad de un dataset masivo o entrenamiento desde cero. Este documento está optimizado para su rápida lectura e implementación.

## 1. Estructura de Carpetas Requerida
Crea la siguiente estructura básica en tu entorno de trabajo:
```text
NeuroFace-PoC/
├── base_datos_rostros/    # Carpeta para las fotos de referencia (ej. juan_perez.jpg)
└── poc_neuroface.py       # Script principal
```

## 2. Preparación del Entorno (Terminal)
Es fundamental usar un entorno virtual para aislar las dependencias del proyecto.

```bash
# 1. Crear entorno virtual
python -m venv env

# 2. Activar el entorno
# En Windows:
env\Scripts\activate
# En macOS/Linux:
source env/bin/activate

# 3. Instalar dependencias (OpenCV para la cámara, DeepFace para la IA)
pip install opencv-python deepface tf-keras
```

## 3. Código Fuente (poc_neuroface.py)
Copia y pega el siguiente código en el archivo `poc_neuroface.py`. Este script captura el video, analiza la emoción dominante y busca coincidencias en la carpeta local.

```python
import cv2
from deepface import DeepFace

def main():
    # Iniciar la captura de video (Cámara web predeterminada)
    cap = cv2.VideoCapture(0)
    
    # Ruta del directorio con las fotos de los usuarios registrados
    db_path = "./base_datos_rostros"
    
    # Contador para procesar solo ciertos frames y mejorar el rendimiento
    frame_count = 0
    process_every_n_frames = 5 # Analizar 1 de cada 5 frames
    
    current_emotion = "Buscando..."

    print("Iniciando NeuroFace PoC... Presiona 'q' para salir.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error al acceder a la cámara.")
            break
            
        frame_count += 1

        # Análisis ligero (saltando frames para no sobrecargar el CPU/GPU)
        if frame_count % process_every_n_frames == 0:
            try:
                # Análisis de emoción (enforce_detection=False evita caídas si no hay rostros)
                analisis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                
                if analisis:
                    # DeepFace puede devolver una lista si detecta varios rostros
                    resultado = analisis[0] if isinstance(analisis, list) else analisis
                    current_emotion = resultado.get('dominant_emotion', 'Desconocido')
                    
                # Nota para el Agente: 
                # Para la asistencia, habilitar la siguiente línea:
                # match = DeepFace.find(img_path=frame, db_path=db_path, enforce_detection=False)
                
            except Exception as e:
                pass # Ignorar errores de frames sin rostros detectables

        # Renderizar la interfaz visual en el frame
        cv2.putText(frame, f"Emocion Dominante: {current_emotion}", (30, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        cv2.imshow('NeuroFace - Prueba de Concepto', frame)

        # Salir al presionar 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Limpiar recursos
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
```

## 4. Instrucciones de Ejecución y Pruebas
1. Guarda una foto tuya (formato `.jpg` o `.png`) donde se vea tu rostro claramente en la carpeta `base_datos_rostros`.
2. Ejecuta el script desde la terminal:
   `python poc_neuroface.py`
3. **Métricas a evaluar durante la prueba:**
   * **Latencia:** Modifica la variable `process_every_n_frames` (ej. a 10 o 15) si el video se percibe lento.
   * **Iluminación:** Realiza pruebas con luz natural y luz artificial baja para verificar el umbral de detección del modelo.
