import React, { useState } from 'react';
import './Login.css';


type LoginRole = 'user' | 'admin';

interface LoginProps {
  onLogin: () => void;
  onAdminLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onAdminLogin }) => {
  const [role, setRole] = useState<LoginRole>('user');

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <h1>NeuroFace</h1>
          </div>
          
        </div>

        <div className="role-tabs">
          <button 
            className={`tab ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
          >
            Usuario
          </button>
          <button 
            className={`tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Administrador
          </button>
          <div className={`tab-indicator ${role}`}></div>
        </div>

        <div className="form-container">
          {role === 'user' ? (
            <div className="form-content fade-in">
              <div className="input-group">
                <label>Usuario</label>
                <input type="text" placeholder="...@neuroface.com" />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <button className="primary-btn" onClick={onLogin}>
                <span>Acceder como Usuario</span>
              </button>
              
              
              
            </div>
          ) : (
            <div className="form-content fade-in">
              <div className="input-group">
                <label>Usuario Administrador</label>
                <input type="text" placeholder="...@neuroface.com" />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <button className="primary-btn admin-btn" onClick={onAdminLogin}>
                <span>Acceder al Panel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
