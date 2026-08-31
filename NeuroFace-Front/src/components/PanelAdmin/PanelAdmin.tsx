import React, { useState } from 'react';
import './PanelAdmin.css';

interface PanelAdminProps {
  onLogout: () => void;
}

type AdminView = 'dashboard' | 'asistencias' | 'usuarios' | 'areas' | 'reportes';

const PanelAdmin: React.FC<PanelAdminProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo_neuroface.png" alt="NeuroFace Logo" className="sidebar-logo" />
          <h2>NeuroFace</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard General
          </button>
          <button 
            className={`nav-item ${activeView === 'asistencias' ? 'active' : ''}`}
            onClick={() => setActiveView('asistencias')}
          >
            Asistencias
          </button>
          <button 
            className={`nav-item ${activeView === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveView('usuarios')}
          >
            Usuarios
          </button>
          <button 
            className={`nav-item ${activeView === 'areas' ? 'active' : ''}`}
            onClick={() => setActiveView('areas')}
          >
            Áreas
          </button>
          <button 
            className={`nav-item ${activeView === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveView('reportes')}
          >
            Reportes
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-title">
            <h3>Panel de Control</h3>
          </div>
          <div className="header-profile">
            <div className="profile-text">
              <span className="admin-name">Admin Principal</span>
              <span className="admin-role">Super Administrador</span>
            </div>
            <img 
              src="https://ui-avatars.com/api/?name=Admin+NeuroFace&background=8a2be2&color=fff" 
              alt="Admin Avatar" 
              className="admin-avatar"
            />
            <button className="logout-btn-header" onClick={onLogout}>Salir</button>
          </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <main className="admin-content">
          {activeView === 'dashboard' && (
            <div className="view-content fade-in">
              <h2>Dashboard General</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Usuarios Registrados</h4>
                  <p className="stat-number">124</p>
                </div>
                <div className="stat-card">
                  <h4>Asistencias Hoy</h4>
                  <p className="stat-number">89</p>
                </div>
                <div className="stat-card">
                  <h4>Tardanzas</h4>
                  <p className="stat-number warn">12</p>
                </div>
                <div className="stat-card">
                  <h4>Alertas</h4>
                  <p className="stat-number danger">0</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'asistencias' && (
            <div className="view-content fade-in">
              <h2>Registro de Asistencias</h2>
              <div className="mock-panel">
                <p>Aquí se mostrará la tabla en vivo de entradas y salidas.</p>
              </div>
            </div>
          )}

          {activeView === 'usuarios' && (
            <div className="view-content fade-in">
              <h2>Gestión de Usuarios</h2>
              <div className="mock-panel">
                <p>Aquí podrás agregar, editar y eliminar estudiantes o empleados.</p>
              </div>
            </div>
          )}

          {activeView === 'areas' && (
            <div className="view-content fade-in">
              <h2>Gestión de Áreas</h2>
              <div className="mock-panel">
                <p>Configuración de áreas y departamentos de la institución.</p>
              </div>
            </div>
          )}

          {activeView === 'reportes' && (
            <div className="view-content fade-in">
              <h2>Reportes</h2>
              <div className="mock-panel">
                <p>Generación de reportes PDF/Excel y estadísticas detalladas.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PanelAdmin;
