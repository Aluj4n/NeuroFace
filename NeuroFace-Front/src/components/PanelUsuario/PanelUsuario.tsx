import React, { useState, useEffect } from 'react';
import './PanelUsuario.css';

interface PanelUsuarioProps {
  onLogout: () => void;
}

const PanelUsuario: React.FC<PanelUsuarioProps> = ({ onLogout }) => {
  // Estado para la fecha y hora actual (simulando reloj en vivo)
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      setCurrentDateTime(now.toLocaleDateString('es-ES', options));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        
        {/* 1. Sección Perfil */}
        <div className="dash-card profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src="https://ui-avatars.com/api/?name=Anghelo+User&background=2E828B&color=fff" alt="Avatar" />
            </div>
            <div className="profile-details">
              <h2>Cabezon (Usuario de Prueba)</h2>
              <p className="role-text">Estudiante - Ingeniería de Software</p>
              <p className="date-text">{currentDateTime}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
        </div>

        {/* 2. Sección Estado Actual */}
        <div className="dash-card status-card">
          <h3>Estado Actual</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Entrada:</span>
              <span className="status-value">08:00 AM</span>
            </div>
            <div className="status-item">
              <span className="status-label">Salida:</span>
              <span className="status-value">--:--</span>
            </div>
            <div className="status-item">
              <span className="status-label">Estado:</span>
              <span className="status-badge badge-puntual">Puntual</span>
            </div>
          </div>
        </div>

        {/* 3. Sección Botones de Acción (Registro) */}
        <div className="action-buttons-grid">
          <div className="dash-card action-card">
            <div className="action-header">
              <h3>Registrar Entrada</h3>
              <p>Registra tu hora de ingreso con validación facial NeuroFace</p>
            </div>
            <button className="record-btn btn-entry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Registrar Entrada
            </button>
          </div>

          <div className="dash-card action-card">
            <div className="action-header">
              <h3>Registrar Salida</h3>
              <p>Registra tu hora de salida con validación facial NeuroFace</p>
            </div>
            <button className="record-btn btn-exit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Registrar Salida
            </button>
          </div>
        </div>

        {/* 4. Sección Historial */}
        <div className="history-section">
          <h3>Historial Reciente</h3>
          <div className="dash-card history-card">
            <div className="history-item">
              <div className="history-date">Ayer</div>
              <div className="history-details">
                <span>Entrada: 08:05 AM</span>
                <span>Salida: 14:00 PM</span>
              </div>
              <span className="status-badge badge-tarde">Tarde</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PanelUsuario;
