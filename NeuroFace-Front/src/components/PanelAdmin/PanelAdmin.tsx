import React, { useMemo, useState } from 'react';
import './PanelAdmin.css';
import GestionCuentas
  from '../GestionCuentas/GestionCuentas';

interface PanelAdminProps {
  onLogout: () => void;
}

type AdminView = 'dashboard' | 'asistencias' | 'usuarios' | 'areas' | 'reportes';

interface UsuarioSesion {
  id: number;
  usuario: string;
  correo: string;
  nombre: string;
  rol: 'admin' | 'usuario';
}

const PanelAdmin: React.FC<PanelAdminProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  // ==================================================
  // ADMINISTRADOR LOGUEADO
  // ==================================================
  const admin = useMemo<UsuarioSesion>(() => {
    const datosGuardados = sessionStorage.getItem('neuroface_usuario');

    if (datosGuardados) {
      try {
        return JSON.parse(datosGuardados) as UsuarioSesion;
      } catch (error) {
        console.error('No se pudo leer la sesión:', error);
      }
    }

    return {
      id: 0,
      usuario: 'admin',
      correo: 'admin@neuroface.com',
      nombre: 'Administrador NeuroFace',
      rol: 'admin'
    };
  }, []);

  // ==================================================
  // INICIALES DEL ADMIN
  // ==================================================
  const iniciales = useMemo(() => {
    const partes = admin.nombre.trim().split(/\s+/);
    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }, [admin.nombre]);

  // ==================================================
  // CERRAR SESIÓN
  // ==================================================
  const cerrarSesion = () => {
    sessionStorage.removeItem('neuroface_token');
    sessionStorage.removeItem('neuroface_usuario');
    onLogout();
  };

  return (
    <div className="admin-container">
      {/* ==================================================
          SIDEBAR
      ================================================== */}
      <aside className="admin-aside">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <img src="/logo_neuroface.png" alt="NeuroFace" />
          </div>
          <div className="admin-brand-text">
            <h2>NeuroFace</h2>
            <span>ADMIN PLATFORM</span>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-category">GENERAL</div>

          <button
            className={`admin-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span className="admin-nav-icon">◫</span>
            Dashboard
          </button>

          <button
            className={`admin-nav-item ${activeView === 'asistencias' ? 'active' : ''}`}
            onClick={() => setActiveView('asistencias')}
          >
            <span className="admin-nav-icon">✓</span>
            Asistencias
          </button>

          <button
            className={`admin-nav-item ${activeView === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveView('usuarios')}
          >
            <span className="admin-nav-icon">◉</span>
            Usuarios
          </button>

          <button
            className={`admin-nav-item ${activeView === 'areas' ? 'active' : ''}`}
            onClick={() => setActiveView('areas')}
          >
            <span className="admin-nav-icon">◇</span>
            Áreas
          </button>

          <button
            className={`admin-nav-item ${activeView === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveView('reportes')}
          >
            <span className="admin-nav-icon">▤</span>
            Reportes
          </button>
        </nav>

        <div className="admin-aside-footer">
          <div className="admin-status-indicator">
            <span className="status-dot"></span>
            <div className="status-info">
              <strong>Sistema operativo</strong>
              <small>NeuroFace Online</small>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================
          CONTENIDO PRINCIPAL
      ================================================== */}
      <main className="admin-main-content">
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-title">
            <span className="eyebrow">NEUROFACE</span>
            <h1>Panel de administración</h1>
          </div>

          <div className="admin-header-user">
            <div className="user-details">
              <span className="user-name">{admin.nombre}</span>
              <span className="user-role">Administrador</span>
            </div>
            <div className="user-avatar">{iniciales}</div>
            <button className="admin-logout-btn" onClick={cerrarSesion}>
              Salir
            </button>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <section className="admin-view-container">
          {/* DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="dashboard-wrapper">
              {/* WELCOME BANNER */}
              <div className="welcome-banner">
                <div className="welcome-text">
                  <span className="section-subtitle">RESUMEN GENERAL</span>
                  <h2>Bienvenido, {admin.nombre.split(' ')[0]}</h2>
                  <p>Supervisa la actividad general de NeuroFace desde un solo lugar.</p>
                </div>
                <div className="system-pill">
                  <span className="pill-title">ESTADO</span>
                  <strong className="pill-status">Operativo</strong>
                  <span className="pill-desc">Servicios disponibles</span>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-icon">◉</span>
                    <span className="stat-card-tag">Total</span>
                  </div>
                  <span className="stat-card-label">Usuarios registrados</span>
                  <span className="stat-card-value">124</span>
                  <small className="stat-card-sub">Cuentas activas en NeuroFace</small>
                </article>

                <article className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-icon success">✓</span>
                    <span className="stat-card-tag success">Hoy</span>
                  </div>
                  <span className="stat-card-label">Asistencias registradas</span>
                  <span className="stat-card-value">89</span>
                  <small className="stat-card-sub">Entradas registradas hoy</small>
                </article>

                <article className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-icon warning">!</span>
                    <span className="stat-card-tag warning">Atención</span>
                  </div>
                  <span className="stat-card-label">Tardanzas</span>
                  <span className="stat-card-value warning">12</span>
                  <small className="stat-card-sub">Registros fuera de horario</small>
                </article>

                <article className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-icon danger">!</span>
                    <span className="stat-card-tag danger">Sistema</span>
                  </div>
                  <span className="stat-card-label">Alertas</span>
                  <span className="stat-card-value danger">0</span>
                  <small className="stat-card-sub">Sin incidencias críticas</small>
                </article>
              </div>

              {/* MIDDLE SECTION */}
              <div className="dashboard-grid-two">
                {/* ACTIVIDAD DE HOY */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div>
                      <span className="section-subtitle">ACTIVIDAD</span>
                      <h3>Actividad de hoy</h3>
                    </div>
                    <button
                      className="btn-link"
                      onClick={() => setActiveView('asistencias')}
                    >
                      Ver asistencias
                    </button>
                  </div>

                  <div className="activity-list">
                    <div className="activity-row">
                      <div className="activity-icon-box success">✓</div>
                      <div className="activity-info">
                        <strong>Entradas registradas</strong>
                        <span>89 usuarios</span>
                      </div>
                      <span className="activity-number">89</span>
                    </div>

                    <div className="activity-row">
                      <div className="activity-icon-box info">→</div>
                      <div className="activity-info">
                        <strong>Salidas registradas</strong>
                        <span>Jornadas completadas</span>
                      </div>
                      <span className="activity-number">62</span>
                    </div>

                    <div className="activity-row">
                      <div className="activity-icon-box warning">!</div>
                      <div className="activity-info">
                        <strong>Tardanzas detectadas</strong>
                        <span>Registros fuera del horario</span>
                      </div>
                      <span className="activity-number warning">12</span>
                    </div>
                  </div>
                </div>

                {/* ESTADO DE NEUROFACE */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div>
                      <span className="section-subtitle">SISTEMA</span>
                      <h3>Estado de NeuroFace</h3>
                    </div>
                  </div>

                  <div className="services-status-list">
                    <div className="service-item">
                      <div className="service-name">
                        <span className="service-dot active"></span>
                        <strong>API NeuroFace</strong>
                      </div>
                      <span className="service-badge active">Operativa</span>
                    </div>

                    <div className="service-item">
                      <div className="service-name">
                        <span className="service-dot active"></span>
                        <strong>Base de datos</strong>
                      </div>
                      <span className="service-badge active">Conectada</span>
                    </div>

                    <div className="service-item">
                      <div className="service-name">
                        <span className="service-dot active"></span>
                        <strong>Reconocimiento facial</strong>
                      </div>
                      <span className="service-badge active">Disponible</span>
                    </div>

                    <div className="service-item">
                      <div className="service-name">
                        <span className="service-dot active"></span>
                        <strong>Autenticación</strong>
                      </div>
                      <span className="service-badge active">Segura</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION */}
              <div className="dashboard-grid-two">
                {/* ÚLTIMAS ASISTENCIAS */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div>
                      <span className="section-subtitle">REGISTROS</span>
                      <h3>Últimas asistencias</h3>
                    </div>
                    <button
                      className="btn-link"
                      onClick={() => setActiveView('asistencias')}
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Entrada</th>
                          <th>Salida</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="table-user-cell">
                              <span className="cell-avatar">LA</span>
                              <div className="cell-user-info">
                                <strong>Luis Angel</strong>
                                <small>luis_angel</small>
                              </div>
                            </div>
                          </td>
                          <td>08:02</td>
                          <td>—</td>
                          <td>
                            <span className="status-pill active">En jornada</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <div className="table-user-cell">
                              <span className="cell-avatar">BS</span>
                              <div className="cell-user-info">
                                <strong>Brayan Siccha</strong>
                                <small>brayan_siccha</small>
                              </div>
                            </div>
                          </td>
                          <td>07:56</td>
                          <td>17:04</td>
                          <td>
                            <span className="status-pill completed">Completado</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <div className="table-user-cell">
                              <span className="cell-avatar">AL</span>
                              <div className="cell-user-info">
                                <strong>Angelo Lujan</strong>
                                <small>angelo_lujan</small>
                              </div>
                            </div>
                          </td>
                          <td>08:14</td>
                          <td>—</td>
                          <td>
                            <span className="status-pill warning">Tardanza</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ACCIONES RÁPIDAS */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div>
                      <span className="section-subtitle">ACCESOS</span>
                      <h3>Acciones rápidas</h3>
                    </div>
                  </div>

                  <div className="quick-actions-grid">
                    <button
                      className="quick-action-btn"
                      onClick={() => setActiveView('usuarios')}
                    >
                      <span className="action-icon">+</span>
                      <div className="action-text">
                        <strong>Nueva cuenta</strong>
                        <small>Usuario o administrador</small>
                      </div>
                    </button>

                    <button
                      className="quick-action-btn"
                      onClick={() => setActiveView('asistencias')}
                    >
                      <span className="action-icon">✓</span>
                      <div className="action-text">
                        <strong>Asistencias</strong>
                        <small>Revisar registros</small>
                      </div>
                    </button>

                    <button
                      className="quick-action-btn"
                      onClick={() => setActiveView('reportes')}
                    >
                      <span className="action-icon">▤</span>
                      <div className="action-text">
                        <strong>Generar reporte</strong>
                        <small>Estadísticas y registros</small>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISTAS SECUNDARIAS */}
          {activeView === 'asistencias' && (
            <div className="panel-card">
              <span className="section-subtitle">NEUROFACE</span>
              <h2>Registro de Asistencias</h2>
              <p>Aquí mostraremos la tabla en vivo de entradas y salidas.</p>
            </div>
          )}

          {activeView === 'usuarios' && (

            <div className="fade-in">

              <GestionCuentas />

            </div>

          )}

          {activeView === 'areas' && (
            <div className="panel-card">
              <span className="section-subtitle">ORGANIZACIÓN</span>
              <h2>Gestión de Áreas</h2>
              <p>Configuración de áreas y departamentos de la empresa.</p>
            </div>
          )}

          {activeView === 'reportes' && (
            <div className="panel-card">
              <span className="section-subtitle">INFORMACIÓN</span>
              <h2>Reportes</h2>
              <p>Generación de reportes, estadísticas y exportaciones.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PanelAdmin;
