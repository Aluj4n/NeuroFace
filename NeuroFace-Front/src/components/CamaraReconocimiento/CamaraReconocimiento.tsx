    import React, {
    useEffect,
    useRef,
    useState
    } from 'react';

    import './CamaraReconocimiento.css';


    interface ResultadoReconocimiento {
    reconocido: boolean;
    usuario: string | null;
    score: number;
    emocion: string | null;
    error?: string;
    }


    interface CamaraReconocimientoProps {
    tipo: 'entrada' | 'salida';
    onClose: () => void;
    }


    const CamaraReconocimiento: React.FC<
    CamaraReconocimientoProps
    > = ({
    tipo,
    onClose
    }) => {

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);


    const [stream, setStream] =
        useState<MediaStream | null>(null);

    const [analizando, setAnalizando] =
        useState(false);

    const [resultado, setResultado] =
        useState<ResultadoReconocimiento | null>(null);

    const [capturaValidada, setCapturaValidada] =
        useState<Blob | null>(null);

    const [registrando, setRegistrando] =
        useState(false);

    const [mensajeAsistencia, setMensajeAsistencia] =
        useState('');

    const [asistenciaOk, setAsistenciaOk] =
        useState<boolean | null>(null);

    const [errorCamara, setErrorCamara] =
        useState('');


    // ==================================================
    // ABRIR CÁMARA
    // ==================================================

    useEffect(() => {

        let mediaStream: MediaStream | null = null;


        const iniciarCamara = async () => {

        try {

            mediaStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                width: 640,
                height: 480,
                facingMode: 'user'
                },
                audio: false
            });


            setStream(mediaStream);


            if (videoRef.current) {

            videoRef.current.srcObject =
                mediaStream;

            }

        } catch (error) {

            console.error(error);

            setErrorCamara(
            'No se pudo acceder a la cámara.'
            );

        }

        };


        iniciarCamara();


        return () => {

        if (mediaStream) {

            mediaStream
            .getTracks()
            .forEach(track => track.stop());

        }

        };

    }, []);


    // ==================================================
    // CERRAR CÁMARA
    // ==================================================

    const cerrarCamara = () => {

        if (stream) {

        stream
            .getTracks()
            .forEach(track => track.stop());

        }


        setCapturaValidada(null);

        onClose();

    };


    // ==================================================
    // CAPTURAR Y ANALIZAR ROSTRO
    // ==================================================

    const analizarRostro = async () => {

        const video = videoRef.current;
        const canvas = canvasRef.current;


        if (!video || !canvas) {
        return;
        }


        setAnalizando(true);
        setResultado(null);

        setCapturaValidada(null);

        setMensajeAsistencia('');
        setAsistenciaOk(null);


        const contexto =
        canvas.getContext('2d');


        if (!contexto) {

        setAnalizando(false);
        return;

        }


        canvas.width =
        video.videoWidth || 640;

        canvas.height =
        video.videoHeight || 480;


        contexto.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
        );


        canvas.toBlob(

        async blob => {

            if (!blob) {

            setAnalizando(false);
            return;

            }


            try {

            const formData =
                new FormData();


            formData.append(
                'archivo',
                blob,
                'captura.jpg'
            );


            const response = await fetch(
                'http://127.0.0.1:8000/api/reconocimiento',
                {
                method: 'POST',
                body: formData
                }
            );


            if (!response.ok) {

                throw new Error(
                'Error al comunicarse con NeuroFace.'
                );

            }


            const data: ResultadoReconocimiento =
                await response.json();


            setResultado(data);


            if (data.reconocido) {

                // Guardamos temporalmente
                // la captura reconocida
                setCapturaValidada(blob);

                // Pausar imagen
                video.pause();

            } else {

                setCapturaValidada(null);

            }


            } catch (error) {

            console.error(error);


            setResultado({
                reconocido: false,
                usuario: null,
                score: 0,
                emocion: null,
                error:
                'No se pudo conectar con el backend.'
            });

            } finally {

            setAnalizando(false);

            }

        },

        'image/jpeg',
        0.9

        );

    };


    // ==================================================
    // REINTENTAR
    // ==================================================

    const reintentar = async () => {

        setResultado(null);

        setCapturaValidada(null);

        setMensajeAsistencia('');

        setAsistenciaOk(null);


        if (videoRef.current) {

        try {

            await videoRef.current.play();

        } catch (error) {

            console.error(
            'No se pudo reanudar la cámara:',
            error
            );

        }

        }

    };


    // ==================================================
    // CONFIRMAR ASISTENCIA
    // ==================================================

    const confirmarAsistencia = async () => {

        if (!capturaValidada) {
        return;
        }


        setRegistrando(true);

        setMensajeAsistencia('');


        try {

        const formData =
            new FormData();


        formData.append(
            'tipo',
            tipo
        );


        formData.append(
            'archivo',
            capturaValidada,
            'captura_validada.jpg'
        );


        const response = await fetch(
            'http://127.0.0.1:8000/api/asistencia/registrar',
            {
            method: 'POST',
            body: formData
            }
        );


        if (!response.ok) {

            throw new Error(
            'Error al registrar la asistencia.'
            );

        }


        const data =
            await response.json();


        setMensajeAsistencia(
            data.mensaje
        );


        setAsistenciaOk(
            Boolean(data.ok)
        );


        } catch (error) {

        console.error(error);


        setAsistenciaOk(false);

        setMensajeAsistencia(
            'No se pudo registrar la asistencia.'
        );

        } finally {

        setRegistrando(false);

        }

    };


    // ==================================================
    // INTERFAZ
    // ==================================================

    return (

        <div className="camera-overlay">

        <div className="camera-modal">


            {/* HEADER */}

            <div className="camera-header">

            <div className="camera-brand">

                <div className="camera-brand-icon">
                NF
                </div>


                <div>

                <span className="camera-subtitle">
                    NEUROFACE IA
                </span>

                <h2>
                    Verificación de identidad
                </h2>

                <p>
                    Registrar {tipo}
                </p>

                </div>

            </div>


            <div className="camera-header-actions">

                {!errorCamara && (

                <div className="camera-online">

                    <span className="online-dot"></span>

                    Cámara activa

                </div>

                )}


                <button
                className="camera-close"
                onClick={cerrarCamara}
                title="Cerrar"
                >
                ×
                </button>

            </div>

            </div>


            {/* CONTENIDO */}

            <div className="camera-main">


            {/* CÁMARA */}

            <div className="camera-preview-section">

                {errorCamara ? (

                <div className="camera-error">

                    <div className="error-icon">
                    !
                    </div>

                    <h3>
                    No se pudo acceder a la cámara
                    </h3>

                    <p>
                    Revisa los permisos de cámara
                    del navegador e intenta nuevamente.
                    </p>

                </div>

                ) : (

                <div className="video-container">

                    <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    />


                    <div className="video-gradient"></div>


                    <div className="face-guide">

                    <div className="face-target">

                        <span className="corner corner-tl"></span>

                        <span className="corner corner-tr"></span>

                        <span className="corner corner-bl"></span>

                        <span className="corner corner-br"></span>


                        <div className="scan-line"></div>

                    </div>

                    </div>


                    <div className="video-status">

                    <span className="status-dot"></span>

                    {resultado?.reconocido
                        ? 'Rostro capturado'
                        : 'Reconocimiento activo'}

                    </div>


                    <div className="video-help">

                    {resultado?.reconocido
                        ? 'Identidad verificada'
                        : 'Centra tu rostro dentro del marco'}

                    </div>

                </div>

                )}


                <canvas
                ref={canvasRef}
                style={{
                    display: 'none'
                }}
                />

            </div>


            {/* PANEL DERECHO */}

            <div className="recognition-panel">

                <div className="panel-title">

                <span className="panel-step">
                    VERIFICACIÓN FACIAL
                </span>

                <h3>
                    Identidad del usuario
                </h3>

                <p>
                    NeuroFace analizará tus
                    características faciales mediante
                    el modelo entrenado.
                </p>

                </div>


                {/* ESPERANDO */}

                {!resultado && !analizando && (

                <div className="verification-state waiting">

                    <div className="state-icon">
                    ◎
                    </div>

                    <div>

                    <strong>
                        Esperando verificación
                    </strong>

                    <span>
                        Coloca tu rostro frente
                        a la cámara.
                    </span>

                    </div>

                </div>

                )}


                {/* ANALIZANDO */}

                {analizando && (

                <div className="verification-state analyzing">

                    <div className="loader"></div>

                    <div>

                    <strong>
                        Analizando rostro...
                    </strong>

                    <span>
                        Extrayendo características
                        biométricas.
                    </span>

                    </div>

                </div>

                )}


                {/* RESULTADO */}

                {resultado && (

                <>

                    <div
                    className={
                        resultado.reconocido
                        ? 'verification-state success'
                        : 'verification-state denied'
                    }
                    >

                    <div className="state-icon">

                        {resultado.reconocido
                        ? '✓'
                        : '×'}

                    </div>


                    <div>

                        <strong>

                        {resultado.reconocido
                            ? 'Identidad verificada'
                            : 'Rostro no reconocido'}

                        </strong>


                        <span>

                        {resultado.reconocido
                            ? 'El rostro coincide con un usuario registrado.'
                            : 'No encontramos una coincidencia válida.'}

                        </span>

                    </div>

                    </div>


                    {resultado.reconocido && (

                    <div className="identity-data">

                        <div className="identity-row">

                        <span>
                            Usuario
                        </span>

                        <strong>
                            {resultado.usuario}
                        </strong>

                        </div>


                        <div className="identity-row">

                        <span>
                            Confianza
                        </span>

                        <strong className="confidence-value">
                            {resultado.score.toFixed(2)}%
                        </strong>

                        </div>


                        <div className="confidence-bar">

                        <div
                            className="confidence-progress"
                            style={{
                            width:
                                `${Math.min(
                                resultado.score,
                                100
                                )}%`
                            }}
                        />

                        </div>


                        <div className="identity-row">

                        <span>
                            Emoción detectada
                        </span>

                        <strong>
                            {resultado.emocion ??
                            'No detectada'}
                        </strong>

                        </div>

                    </div>

                    )}

                </>

                )}


                {/* RESPUESTA DE ASISTENCIA */}

                {mensajeAsistencia && (

                <div
                    className={
                    asistenciaOk
                        ? 'attendance-feedback attendance-success'
                        : 'attendance-feedback attendance-warning'
                    }
                >

                    <strong>

                    {asistenciaOk
                        ? '✓ Registro completado'
                        : 'Información del registro'}

                    </strong>

                    <p>
                    {mensajeAsistencia}
                    </p>

                </div>

                )}


                {/* CONSEJOS */}

                <div className="camera-tips">

                <span className="tips-title">
                    Para una mejor verificación
                </span>

                <div className="tip">
                    <span>01</span>
                    Mira directamente hacia la cámara.
                </div>

                <div className="tip">
                    <span>02</span>
                    Mantén tu rostro dentro del marco.
                </div>

                <div className="tip">
                    <span>03</span>
                    Utiliza una iluminación adecuada.
                </div>

                </div>

            </div>

            </div>


            {/* FOOTER */}

            <div className="camera-footer">


            {/* ANTES DE RECONOCER */}

            {!resultado?.reconocido && (

                <>

                <button
                    className="camera-cancel-btn"
                    onClick={cerrarCamara}
                >
                    Cancelar
                </button>


                <button
                    className="camera-analyze-btn"
                    onClick={analizarRostro}
                    disabled={
                    analizando ||
                    Boolean(errorCamara)
                    }
                >

                    <span className="button-scan-icon">
                    ◉
                    </span>

                    {analizando
                    ? 'Analizando identidad...'
                    : 'Verificar identidad'}

                </button>

                </>

            )}


            {/* RECONOCIDO */}

            {resultado?.reconocido &&
                !mensajeAsistencia && (

                <>

                    <button
                    className="camera-cancel-btn"
                    onClick={reintentar}
                    disabled={registrando}
                    >
                    Reintentar
                    </button>


                    <button
                    className="camera-analyze-btn"
                    onClick={confirmarAsistencia}
                    disabled={registrando}
                    >

                    {registrando
                        ? 'Registrando...'
                        : tipo === 'entrada'
                        ? 'Confirmar entrada'
                        : 'Confirmar salida'}

                    </button>

                </>

                )}


            {/* ASISTENCIA TERMINADA */}

            {mensajeAsistencia && (

                <button
                className="camera-analyze-btn"
                onClick={cerrarCamara}
                >
                Cerrar
                </button>

            )}

            </div>


        </div>

        </div>

    );

    };


    export default CamaraReconocimiento;