import React, { useState } from 'react';
import Login from './components/Login/Login';
import PanelUsuario from './components/PanelUsuario/PanelUsuario';
import PanelAdmin from './components/PanelAdmin/PanelAdmin';

type ViewState = 'login' | 'user' | 'admin';

function App() {
  // Estado para controlar qué pantalla se está mostrando
  const [currentView, setCurrentView] = useState<ViewState>('login');

  return (
    <>
      {currentView === 'user' && (
        <PanelUsuario onLogout={() => setCurrentView('login')} />
      )}
      
      {currentView === 'admin' && (
        <PanelAdmin onLogout={() => setCurrentView('login')} />
      )}

      {currentView === 'login' && (
        <Login 
          onLogin={() => setCurrentView('user')} 
          onAdminLogin={() => setCurrentView('admin')} 
        />
      )}
    </>
  );
}

export default App;
