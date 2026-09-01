    import React, { useState } from 'react';

    import './GestionCuentas.css';


    type RolCuenta =
    | 'usuario'
    | 'admin';


    interface RespuestaCuenta {
    usuario: string;
    correo: string;
    nombre: string;
    rol: RolCuenta;
    }


    const GestionCuentas: React.FC = () => {

    const [nombre, setNombre] =
        useState('');

    const [usuario, setUsuario] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [rol, setRol] =
        useState<RolCuenta>('usuario');

    const [mostrarPassword, setMostrarPassword] =
        useState(false);

    const [cargando, setCargando] =
        useState(false);

    const [error, setError] =
        useState('');

    const [mensajeExito, setMensajeExito] =
        useState('');

    const [correoCreado, setCorreoCreado] =
        useState('');


    // ==================================================
    // CORREO PREVISUALIZADO
    // ==================================================

    const correoGenerado = usuario
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');


    // ==================================================
    // CREAR CUENTA
    // ==================================================

    const crearCuenta = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        setError('');
        setMensajeExito('');
        setCorreoCreado('');


        // ==============================================
        // VALIDACIONES
        // ==============================================

        if (!nombre.trim()) {

        setError(
            'Ingresa el nombre completo.'
        );

        return;

        }


        if (!usuario.trim()) {

        setError(
            'Ingresa el nombre de usuario.'
        );

        return;

        }


        if (password.length < 8) {

        setError(
            'La contraseña debe tener mínimo 8 caracteres.'
        );

        return;

        }


        // ==============================================
        // TOKEN ADMIN
        // ==============================================

        const token =
        sessionStorage.getItem(
            'neuroface_token'
        );


        if (!token) {

        setError(
            'No existe una sesión administrativa activa.'
        );

        return;

        }


        setCargando(true);


        try {

        const response = await fetch(
            'http://127.0.0.1:8000/api/admin/usuarios',
            {

            method: 'POST',

            headers: {

                'Content-Type':
                'application/json',

                Authorization:
                `Bearer ${token}`

            },

            body: JSON.stringify({

                usuario:
                usuario.trim(),

                nombre:
                nombre.trim(),

                password,

                rol

            })

            }
        );


        const data =
            await response.json();


        // ============================================
        // ERROR BACKEND
        // ============================================

        if (!response.ok) {

            setError(
            data.detail
            ?? 'No se pudo crear la cuenta.'
            );

            return;

        }


        // ============================================
        // CUENTA CREADA
        // ============================================

        const cuenta:
            RespuestaCuenta = data.cuenta;


        setCorreoCreado(
            cuenta.correo
        );


        setMensajeExito(

            rol === 'admin'
            ? 'Administrador registrado correctamente.'
            : 'Usuario registrado correctamente.'

        );


        // ============================================
        // LIMPIAR FORMULARIO
        // ============================================

        setNombre('');
        setUsuario('');
        setPassword('');
        setRol('usuario');


        } catch (error) {

        console.error(
            'Error creando cuenta:',
            error
        );


        setError(
            'No se pudo conectar con el servidor NeuroFace.'
        );


        } finally {

        setCargando(false);

        }

    };


    return (

        <section className="gestion-cuentas">


        {/* =============================================
            HEADER
        ============================================== */}

        <header className="gestion-header">

            <div>

            <span className="gestion-eyebrow">
                ADMINISTRACIÓN
            </span>

            <h1>
                Registrar nueva cuenta
            </h1>

            <p>
                Registra usuarios y administradores
                autorizados para utilizar NeuroFace.
            </p>

            </div>


            <div className="gestion-status">

            <span></span>

            Sesión administrativa

            </div>

        </header>



        {/* =============================================
            FORMULARIO
        ============================================== */}

        <div className="gestion-form-wrapper">


            <form
            className="cuenta-form-card"
            onSubmit={crearCuenta}
            >


            {/* CABECERA */}

            <div className="cuenta-form-header">

                <div className="cuenta-step">
                +
                </div>


                <div>

                <h2>
                    Nueva cuenta
                </h2>

                <p>
                    Completa la información del nuevo integrante.
                </p>

                </div>

            </div>



            {/* ==========================================
                TIPO DE CUENTA
            =========================================== */}

            <div className="gestion-field">

                <label>
                Tipo de cuenta
                </label>


                <div className="role-selector">


                <button

                    type="button"

                    className={
                    rol === 'usuario'
                        ? 'active'
                        : ''
                    }

                    onClick={() =>
                    setRol('usuario')
                    }

                >

                    <span className="role-letter">
                    U
                    </span>


                    <div>

                    <strong>
                        Usuario
                    </strong>

                    <small>
                        Acceso estándar al sistema
                    </small>

                    </div>

                </button>



                <button

                    type="button"

                    className={
                    rol === 'admin'
                        ? 'active'
                        : ''
                    }

                    onClick={() =>
                    setRol('admin')
                    }

                >

                    <span className="role-letter">
                    A
                    </span>


                    <div>

                    <strong>
                        Administrador
                    </strong>

                    <small>
                        Gestión administrativa
                    </small>

                    </div>

                </button>


                </div>

            </div>



            {/* ==========================================
                DATOS
            =========================================== */}

            <div className="form-two-columns">


                <div className="gestion-field">

                <label>
                    Nombre completo
                </label>


                <input

                    type="text"

                    placeholder=""

                    value={nombre}

                    onChange={event =>
                    setNombre(
                        event.target.value
                    )
                    }

                    disabled={cargando}

                />

                </div>



                <div className="gestion-field">

                <label>
                    Nombre de usuario
                </label>


                <input

                    type="text"

                    placeholder=""

                    value={usuario}

                    onChange={event =>
                    setUsuario(
                        event.target.value
                    )
                    }

                    disabled={cargando}

                />

                </div>


            </div>



            {/* CORREO GENERADO */}

            {usuario.trim() && (

                <div className="correo-preview">

                <div>

                    <span>
                    Correo empresarial generado
                    </span>

                    <strong>

                    {correoGenerado}
                    @neuroface.com

                    </strong>

                </div>


                <div className="correo-domain">
                    NEUROFACE
                </div>

                </div>

            )}



            {/* ==========================================
                PASSWORD
            =========================================== */}

            <div className="gestion-field">

                <label>
                Contraseña inicial
                </label>


                <div className="gestion-password">

                <input

                    type={
                    mostrarPassword
                        ? 'text'
                        : 'password'
                    }

                    placeholder="Mínimo 8 caracteres"

                    value={password}

                    onChange={event =>
                    setPassword(
                        event.target.value
                    )
                    }

                    disabled={cargando}

                />


                <button

                    type="button"

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


                <small className="field-help">

                El administrador deberá entregar
                esta contraseña al nuevo usuario.

                </small>

            </div>



            {/* ==========================================
                ERROR
            =========================================== */}

            {error && (

                <div className="gestion-error">

                <div>
                    !
                </div>

                <span>
                    {error}
                </span>

                </div>

            )}



            {/* ==========================================
                ÉXITO
            =========================================== */}

            {mensajeExito && (

                <div className="gestion-success">

                <div className="success-check">
                    ✓
                </div>


                <div>

                    <strong>
                    {mensajeExito}
                    </strong>

                    <span>
                    Correo: {correoCreado}
                    </span>

                </div>

                </div>

            )}



            {/* ==========================================
                BOTÓN
            =========================================== */}

            <button

                type="submit"

                className="crear-cuenta-button"

                disabled={cargando}

            >

                {cargando
                ? 'Registrando cuenta...'
                : rol === 'admin'
                    ? 'Registrar administrador'
                    : 'Registrar usuario'}

                {!cargando && (
                <span>
                    →
                </span>
                )}

            </button>


            </form>

        </div>

        </section>

    );

    };


    export default GestionCuentas;