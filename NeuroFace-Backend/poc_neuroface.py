import cv2
from deepface import DeepFace
import os

def main():
    # Iniciar la captura de video (Cámara web predeterminada)
    cap = cv2.VideoCapture(0)
    
    # Ruta del directorio con las fotos de los usuarios registrados
    db_path = "./base_datos_rostros"
    
    # Crear la carpeta si no existe
    if not os.path.exists(db_path):
        os.makedirs(db_path)
    
    # Contador para procesar solo ciertos frames y mejorar el rendimiento
    frame_count = 0
    process_every_n_frames = 30 # Analizar 1 de cada 30 frames (aprox 1 vez por segundo)
    
    current_emotion = "Buscando..."
    current_user = "Desconocido"

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
                analisis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, detector_backend="mtcnn")
                
                if analisis:
                    # DeepFace puede devolver una lista si detecta varios rostros
                    resultado = analisis[0] if isinstance(analisis, list) else analisis
                    current_emotion = resultado.get('dominant_emotion', 'Desconocido')
                    
                # Buscar rostro en la base de datos para la asistencia
                matches = DeepFace.find(img_path=frame, db_path=db_path, enforce_detection=False, silent=True, detector_backend="mtcnn")
                if matches and len(matches) > 0 and not matches[0].empty:
                    # Extrae la ruta de la foto que hizo coincidencia
                    match_path = matches[0]['identity'][0]
                    
                    # Extraer el nombre de la carpeta padre (ej: 'anghelo' de 'base_datos_rostros/anghelo/foto.jpg')
                    carpeta_padre = os.path.basename(os.path.dirname(match_path))
                    
                    # Si la foto está dentro de una subcarpeta, usamos ese nombre. 
                    # Si no, usamos el nombre de la foto.
                    if carpeta_padre and carpeta_padre != os.path.basename(db_path):
                        current_user = carpeta_padre.capitalize()
                    else:
                        current_user = os.path.basename(match_path).split('.')[0].capitalize()
                else:
                    current_user = "Desconocido"
                
            except Exception as e:
                # Mostrar el error en la terminal para poder diagnosticar qué pasa
                print(f"Error detectando rostro: {e}")
                current_user = "Desconocido"
                current_emotion = "Buscando..."

        # Renderizar la interfaz visual en el frame
        cv2.putText(frame, f"Emocion: {current_emotion}", (30, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(frame, f"Usuario: {current_user}", (30, 90), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
        
        cv2.imshow('NeuroFace - Prueba de Concepto', frame)

        # Salir al presionar 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Limpiar recursos
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
