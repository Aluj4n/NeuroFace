import React, { useState } from 'react';
import './Login.css';


type LoginRole = 'user' | 'admin';


interface LoginProps {
  onLogin: () => void;
  onAdminLogin: () => void;
}


interface UsuarioLogin {
  id: number;
  usuario: string;
  correo: string;
  nombre: string;
  rol: 'usuario' | 'admin';
}


interface LoginResponse {
  ok: boolean;
  mensaje: string;
  token: string;
  token_type: string;
  usuario: UsuarioLogin;
}


const Login: React.FC<LoginProps> = ({
  onLogin,
  onAdminLogin
}) => {

  const [role, setRole] =
    useState<LoginRole>('user');

  const [correo, setCorreo] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [error, setError] =
    useState('');

  const [cargando, setCargando] =
    useState(false);


  // ==================================================
  // INICIAR SESIÓN
  // ==================================================

  const iniciarSesion = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setError('');


    if (!correo.trim()) {

      setError(
        'Ingresa tu correo empresarial.'
      );

      return;
    }


    if (
      !correo
        .trim()
        .toLowerCase()
        .endsWith('@neuroface.com')
    ) {

      setError(
        'El correo debe pertenecer al dominio @neuroface.com.'
      );

      return;
    }


    if (!password) {

      setError(
        'Ingresa tu contraseña.'
      );

      return;
    }


    setCargando(true);


    try {

      const response = await fetch(
        'http://127.0.0.1:8000/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            correo:
              correo.trim().toLowerCase(),

            password
          })
        }
      );


      if (!response.ok) {

        let mensaje =
          'Correo o contraseña incorrectos.';


        try {

          const errorBackend =
            await response.json();

          if (errorBackend.detail) {

            mensaje =
              errorBackend.detail;

          }

        } catch {

          // mensaje general

        }


        setError(mensaje);

        return;
      }


      const data: LoginResponse =
        await response.json();


      // ==============================================
      // GUARDAR SESIÓN
      // ==============================================

      sessionStorage.setItem(
        'neuroface_token',
        data.token
      );


      sessionStorage.setItem(
        'neuroface_usuario',
        JSON.stringify(
          data.usuario
        )
      );


      // ==============================================
      // REDIRECCIÓN SEGÚN ROL
      // ==============================================

      if (
        data.usuario.rol === 'admin'
      ) {

        onAdminLogin();

      } else {

        onLogin();

      }


    } catch (error) {

      console.error(
        'Error al iniciar sesión:',
        error
      );


      setError(
        'No se pudo establecer conexión con NeuroFace.'
      );


    } finally {

      setCargando(false);

    }

  };


  // ==================================================
  // CAMBIAR TIPO DE ACCESO
  // ==================================================

  const cambiarRol = (
    nuevoRol: LoginRole
  ) => {

    setRole(nuevoRol);

    setCorreo('');

    setPassword('');

    setError('');

  };


  return (

    <main className="login-page">


      {/* =============================================
          PANEL DE EMPRESA
      ============================================== */}

      <section className="login-company">


        <div className="company-decoration company-circle-1"></div>

        <div className="company-decoration company-circle-2"></div>


        {/* LOGO */}

        <div className="company-logo">

          <div className="company-logo-icon">
            N
          </div>

          <div className="company-logo-info">

            <strong>
              NeuroFace
            </strong>

            <span>
              ENTERPRISE IDENTITY
            </span>

          </div>

        </div>



        {/* CONTENIDO */}

        <div className="company-content">


          <span className="company-label">
            TECNOLOGÍA EMPRESARIAL
          </span>


          <h1>

            Identidad biométrica
            para una gestión

            <span>
              más inteligente.
            </span>

          </h1>


          <p>

            NeuroFace integra reconocimiento facial,
            inteligencia artificial y control de
            asistencia en una plataforma empresarial
            centralizada.

          </p>



          {/* SERVICIOS */}

          <div className="company-services">


            <div className="company-service">

              <span className="service-number">
                01
              </span>

              <div>

                <strong>
                  Reconocimiento facial
                </strong>

                <small>
                  Validación inteligente de identidad
                </small>

              </div>

            </div>


            <div className="company-service">

              <span className="service-number">
                02
              </span>

              <div>

                <strong>
                  Control de asistencia
                </strong>

                <small>
                  Registro de entradas y salidas
                </small>

              </div>

            </div>


            <div className="company-service">

              <span className="service-number">
                03
              </span>

              <div>

                <strong>
                  Gestión empresarial
                </strong>

                <small>
                  Administración centralizada
                </small>

              </div>

            </div>

          </div>

        </div>



        {/* FOOTER IZQUIERDO */}

        <div className="company-footer">

          <div className="company-online">

            <span></span>

            Plataforma disponible

          </div>


          <small>
            NeuroFace Technologies
          </small>

        </div>

      </section>



      {/* =============================================
          LOGIN
      ============================================== */}

      <section className="login-access">


        <div className="login-box">


          {/* LOGO MOBILE */}

          <div className="mobile-logo">

            <div className="company-logo-icon">
              N
            </div>

            <strong>
              NeuroFace
            </strong>

          </div>



          {/* CABECERA */}

          <header className="login-header">

            <span className="login-section-label">
              PORTAL EMPRESARIAL
            </span>


            <h2>
              Bienvenido
            </h2>


            <p>
              Inicia sesión con tu cuenta empresarial
              de NeuroFace.
            </p>

          </header>



          {/* ROLES */}

          <div className="login-role-tabs">


            <button

              type="button"

              className={
                role === 'user'
                  ? 'active'
                  : ''
              }

              onClick={() =>
                cambiarRol('user')
              }

            >

              <span className="role-symbol">
                U
              </span>

              Usuario

            </button>


            <button

              type="button"

              className={
                role === 'admin'
                  ? 'active'
                  : ''
              }

              onClick={() =>
                cambiarRol('admin')
              }

            >

              <span className="role-symbol">
                A
              </span>

              Administrador

            </button>

          </div>



          {/* FORMULARIO */}

          <form
            className="login-form"
            onSubmit={iniciarSesion}
          >


            {/* CORREO */}

            <div className="form-field">

              <label>
                Correo empresarial
              </label>


              <div className="form-input">

                <span className="input-prefix">
                  @
                </span>


                <input

                  type="email"

                  placeholder={
                    role === 'admin'
                      ? 'admin@neuroface.com'
                      : 'usuario@neuroface.com'
                  }

                  value={correo}

                  onChange={event =>
                    setCorreo(
                      event.target.value
                    )
                  }

                  disabled={cargando}

                  autoComplete="email"

                />

              </div>

            </div>



            {/* PASSWORD */}

            <div className="form-field">

              <div className="field-heading">

                <label>
                  Contraseña
                </label>

              </div>


              <div className="form-input">

                <span className="input-prefix">
                  •
                </span>


                <input

                  type={
                    mostrarPassword
                      ? 'text'
                      : 'password'
                  }

                  placeholder="Ingresa tu contraseña"

                  value={password}

                  onChange={event =>
                    setPassword(
                      event.target.value
                    )
                  }

                  disabled={cargando}

                  autoComplete="current-password"

                />


                <button

                  type="button"

                  className="show-password"

                  onClick={() =>
                    setMostrarPassword(
                      !mostrarPassword
                    )
                  }

                >

                  {mostrarPassword
                    ? 'Ocultar'
                    : 'Mostrar'}

                </button>

              </div>

            </div>



            {/* ERROR */}

            {error && (

              <div className="login-message-error">

                <span>
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>

            )}



            {/* BOTÓN */}

            <button

              type="submit"

              className="login-submit"

              disabled={cargando}

            >

              {cargando ? (

                <>

                  <span className="login-loader"></span>

                  Verificando acceso...

                </>

              ) : (

                <>

                  {role === 'admin'
                    ? 'Ingresar como administrador'
                    : 'Iniciar sesión'}

                  <span className="button-arrow">
                    →
                  </span>

                </>

              )}

            </button>

          </form>



          {/* INFO SEGURIDAD */}

          <div className="login-security">

            <div className="security-mark">
              ✓
            </div>

            <div>

              <strong>
                Acceso empresarial protegido
              </strong>

              <span>
                Sistema de autenticación seguro
                de NeuroFace.
              </span>

            </div>

          </div>



          {/* FOOTER */}

          <footer className="login-footer">

            <span>
              © 2026 NeuroFace
            </span>

            <span>
              Identity & Biometric Platform
            </span>

          </footer>

        </div>

      </section>

    </main>

  );

};


export default Login;
