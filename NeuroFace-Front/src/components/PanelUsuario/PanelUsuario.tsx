import React, {
  useCallback,
  useEffect,
  useState
} from 'react';

import './PanelUsuario.css';

import CamaraReconocimiento
  from '../CamaraReconocimiento/CamaraReconocimiento';


// ==================================================
// INTERFACES
// ==================================================

interface PanelUsuarioProps {
  onLogout: () => void;
}


interface RegistroHistorial {
  fecha: string;
  entrada: string | null;
  salida: string | null;
}


interface DatosAsistencia {

  usuario: string;

  hoy: {
    entrada: string | null;
    salida: string | null;
    estado: string;
  };

  historial: RegistroHistorial[];

}


interface UsuarioSesion {
  id: number;
  usuario: string;
  correo: string;
  nombre: string;
  rol: 'usuario' | 'admin';
}


// ==================================================
// COMPONENTE
// ==================================================

const PanelUsuario: React.FC<PanelUsuarioProps> = ({
  onLogout
}) => {


  // ==================================================
  // USUARIO LOGEADO
  // ==================================================

  const [usuarioSesion] =
    useState<UsuarioSesion | null>(() => {

      const datos =
        sessionStorage.getItem(
          'neuroface_usuario'
        );


      if (!datos) {

        return null;

      }


      try {

        return JSON.parse(
          datos
        ) as UsuarioSesion;

      } catch (error) {

        console.error(
          'Error leyendo la sesión:',
          error
        );

        return null;

      }

    });


  // ==================================================
  // DATOS DINÁMICOS
  // ==================================================

  const USUARIO_ACTUAL =
    usuarioSesion?.usuario ?? '';


  const NOMBRE_ACTUAL =
    usuarioSesion?.nombre
    ?? 'Usuario NeuroFace';


  const CORREO_ACTUAL =
    usuarioSesion?.correo
    ?? '';


  // ==================================================
  // AVATAR DINÁMICO
  // ==================================================

  const avatarUrl =

    `https://ui-avatars.com/api/?name=${
      encodeURIComponent(
        NOMBRE_ACTUAL
      )
    }&background=2E828B&color=fff&bold=true`;


  // ==================================================
  // ESTADOS
  // ==================================================

  const [
    currentDateTime,
    setCurrentDateTime
  ] = useState<string>('');


  const [
    camaraAbierta,
    setCamaraAbierta
  ] = useState<boolean>(false);


  const [
    tipoRegistro,
    setTipoRegistro
  ] = useState<
    'entrada' | 'salida'
  >('entrada');


  const [
    datosAsistencia,
    setDatosAsistencia
  ] = useState<
    DatosAsistencia | null
  >(null);


  const [
    cargandoAsistencia,
    setCargandoAsistencia
  ] = useState<boolean>(true);


  const [
    errorAsistencia,
    setErrorAsistencia
  ] = useState<string>('');


  // ==================================================
  // CARGAR ASISTENCIAS DEL USUARIO LOGEADO
  // ==================================================

  const cargarAsistencia =
    useCallback(async () => {


      // ----------------------------------------------
      // VALIDAR SESIÓN
      // ----------------------------------------------

      if (!USUARIO_ACTUAL) {

        setDatosAsistencia(null);

        setCargandoAsistencia(false);

        setErrorAsistencia(
          'No se encontró una sesión activa.'
        );

        return;

      }


      try {

        setCargandoAsistencia(true);

        setErrorAsistencia('');


        // --------------------------------------------
        // CONSULTAR ASISTENCIA DEL USUARIO REAL
        // --------------------------------------------

        const response = await fetch(

          `http://127.0.0.1:8000/api/asistencia/${
            encodeURIComponent(
              USUARIO_ACTUAL
            )
          }`

        );


        if (!response.ok) {

          throw new Error(
            'No se pudieron cargar las asistencias.'
          );

        }


        const data:
          DatosAsistencia =
          await response.json();


        setDatosAsistencia(
          data
        );


      } catch (error) {

        console.error(
          'Error cargando asistencias:',
          error
        );


        setErrorAsistencia(
          'No se pudo conectar con el servidor de asistencias.'
        );


      } finally {

        setCargandoAsistencia(
          false
        );

      }


    }, [USUARIO_ACTUAL]);


  // ==================================================
  // CARGAR ASISTENCIA AL ABRIR PANEL
  // ==================================================

  useEffect(() => {

    cargarAsistencia();

  }, [cargarAsistencia]);


  // ==================================================
  // RELOJ EN TIEMPO REAL
  // ==================================================

  useEffect(() => {

    const updateTime = () => {

      const now =
        new Date();


      const options:
        Intl.DateTimeFormatOptions = {

        weekday: 'long',

        year: 'numeric',

        month: 'long',

        day: 'numeric',

        hour: '2-digit',

        minute: '2-digit',

        second: '2-digit'

      };


      const fecha =
        now.toLocaleDateString(
          'es-ES',
          options
        );


      // Primera letra en mayúscula
      const fechaFormateada =

        fecha.charAt(0).toUpperCase()
        +
        fecha.slice(1);


      setCurrentDateTime(
        fechaFormateada
      );

    };


    updateTime();


    const interval =
      setInterval(
        updateTime,
        1000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  // ==================================================
  // ABRIR CÁMARA
  // ==================================================

  const abrirCamara = (
    tipo: 'entrada' | 'salida'
  ) => {

    setTipoRegistro(
      tipo
    );

    setCamaraAbierta(
      true
    );

  };


  // ==================================================
  // CERRAR CÁMARA
  // ==================================================

  const cerrarCamara = () => {

    setCamaraAbierta(
      false
    );


    // Recargar asistencia después
    // de cerrar reconocimiento
    cargarAsistencia();

  };


  // ==================================================
  // CERRAR SESIÓN
  // ==================================================

  const cerrarSesion = () => {

    sessionStorage.removeItem(
      'neuroface_token'
    );

    sessionStorage.removeItem(
      'neuroface_usuario'
    );


    onLogout();

  };


  // ==================================================
  // FORMATEAR FECHA
  // ==================================================

  const formatearFecha = (
    fecha: string
  ) => {

    const fechaLocal =
      new Date(
        `${fecha}T00:00:00`
      );


    return fechaLocal.toLocaleDateString(
      'es-ES',
      {

        day: '2-digit',

        month: '2-digit',

        year: 'numeric'

      }
    );

  };


  // ==================================================
  // ESTADO DE LA JORNADA
  // ==================================================

  const entradaRegistrada =
    Boolean(
      datosAsistencia?.hoy.entrada
    );


  const salidaRegistrada =
    Boolean(
      datosAsistencia?.hoy.salida
    );


  // ==================================================
  // INTERFAZ
  // ==================================================

  return (

    <div className="dashboard-container">

      <div className="dashboard-content">


        {/* ==================================================
            1. PERFIL
        ================================================== */}

        <div className="dash-card profile-card">


          <div className="profile-info">


            {/* AVATAR */}

            <div className="profile-avatar">

              <img

                src={avatarUrl}

                alt={
                  `Avatar de ${NOMBRE_ACTUAL}`
                }

              />

            </div>



            {/* INFORMACIÓN */}

            <div className="profile-details">


              <h2>
                {NOMBRE_ACTUAL}
              </h2>


              <p className="role-text">

                Usuario NeuroFace

                {CORREO_ACTUAL && (
                  <>
                    {' · '}
                    {CORREO_ACTUAL}
                  </>
                )}

              </p>


              <p className="date-text">
                {currentDateTime}
              </p>


            </div>

          </div>



          {/* CERRAR SESIÓN */}

          <button

            className="logout-btn"

            onClick={cerrarSesion}

          >

            Cerrar Sesión

          </button>

        </div>



        {/* ==================================================
            2. ESTADO ACTUAL
        ================================================== */}

        <div className="dash-card status-card">


          <h3>
            Estado Actual
          </h3>



          {/* ERROR */}

          {errorAsistencia && (

            <p className="attendance-load-error">

              {errorAsistencia}

            </p>

          )}



          <div className="status-grid">


            {/* ENTRADA */}

            <div className="status-item">

              <span className="status-label">
                Entrada:
              </span>


              <span className="status-value">

                {cargandoAsistencia
                  ? 'Cargando...'
                  : datosAsistencia?.hoy.entrada
                    ?? '--:--'}

              </span>

            </div>



            {/* SALIDA */}

            <div className="status-item">

              <span className="status-label">
                Salida:
              </span>


              <span className="status-value">

                {cargandoAsistencia
                  ? 'Cargando...'
                  : datosAsistencia?.hoy.salida
                    ?? '--:--'}

              </span>

            </div>



            {/* ESTADO */}

            <div className="status-item">

              <span className="status-label">
                Estado:
              </span>


              <span
                className="status-badge badge-puntual"
              >

                {cargandoAsistencia
                  ? 'Cargando...'
                  : datosAsistencia?.hoy.estado
                    ?? 'Sin registrar'}

              </span>

            </div>

          </div>

        </div>



        {/* ==================================================
            3. REGISTRAR ENTRADA / SALIDA
        ================================================== */}

        <div className="action-buttons-grid">


          {/* ENTRADA */}

          <div className="dash-card action-card">

            <div className="action-header">


              <h3>
                Registrar Entrada
              </h3>


              <p>

                Registra tu hora de ingreso con
                validación facial NeuroFace.

              </p>

            </div>



        <button
          className="record-btn btn-entry"
          onClick={() =>
            abrirCamara('entrada')
          }
          disabled={cargandoAsistencia}
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >

            <path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            />

            <circle
              cx="12"
              cy="13"
              r="4"
            />

          </svg>

          <span>
            Registrar Entrada
          </span>

        </button>

          </div>



          {/* SALIDA */}

          <div className="dash-card action-card">


            <div className="action-header">


              <h3>
                Registrar Salida
              </h3>


              <p>

                Registra tu hora de salida con
                validación facial NeuroFace.

              </p>

            </div>



<button
  className="record-btn btn-exit"
  onClick={() =>
    abrirCamara('salida')
  }
  disabled={cargandoAsistencia}
>

  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >

    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
    />

    <circle
      cx="12"
      cy="13"
      r="4"
    />

  </svg>

  <span>
    Registrar Salida
  </span>

</button>

          </div>

        </div>



        {/* ==================================================
            4. HISTORIAL
        ================================================== */}

        <div className="history-section">


          <h3>
            Historial Reciente
          </h3>



          <div className="dash-card history-card">


            {/* CARGANDO */}

            {cargandoAsistencia && (

              <div className="history-item">

                <div className="history-details">

                  <span>
                    Cargando historial...
                  </span>

                </div>

              </div>

            )}



            {/* CON REGISTROS */}

            {!cargandoAsistencia
              &&
              datosAsistencia
              &&
              datosAsistencia.historial.length > 0
              && (

                datosAsistencia.historial

                  .slice(
                    0,
                    5
                  )

                  .map(
                    registro => (

                      <div

                        className="history-item"

                        key={
                          registro.fecha
                        }

                      >


                        {/* FECHA */}

                        <div className="history-date">

                          {formatearFecha(
                            registro.fecha
                          )}

                        </div>



                        {/* HORAS */}

                        <div className="history-details">


                          <span>

                            Entrada:{' '}

                            {
                              registro.entrada
                              ??
                              'Sin registrar'
                            }

                          </span>


                          <span>

                            Salida:{' '}

                            {
                              registro.salida
                              ??
                              'Sin registrar'
                            }

                          </span>


                        </div>



                        {/* ESTADO */}

                        <span
                          className="status-badge badge-puntual"
                        >

                          {
                            registro.entrada
                            &&
                            registro.salida

                              ? 'Completado'

                              : registro.entrada

                                ? 'En curso'

                                : 'Pendiente'
                          }

                        </span>


                      </div>

                    )
                  )

              )}



            {/* SIN REGISTROS */}

            {!cargandoAsistencia
              &&
              (
                !datosAsistencia
                ||
                datosAsistencia.historial.length === 0
              )
              && (

                <div className="history-item">

                  <div className="history-details">

                    <span>

                      Todavía no tienes
                      asistencias registradas.

                    </span>

                  </div>

                </div>

              )}

          </div>

        </div>


      </div>



      {/* ==================================================
          5. RECONOCIMIENTO FACIAL
      ================================================== */}

      {camaraAbierta && (

        <CamaraReconocimiento

          tipo={tipoRegistro}

          onClose={cerrarCamara}

        />

      )}

    </div>

  );

};


export default PanelUsuario;
