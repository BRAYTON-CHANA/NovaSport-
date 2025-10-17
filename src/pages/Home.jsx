import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import Estadiopng from '../images/estadio.jpg'

// Componente de tarjeta (ahora solo decorativo)
const DecorativeCard = ({ title, description, icon }) => (
  <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-500/30 mb-4">
      {icon}
    </div>
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">{title}</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{description}</p>
  </div>
);

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Iconos (se mantienen igual)
  const horariosIcon = <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  const facturasIcon = <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5h.01" /></svg>;
  const reportesIcon = <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm8-14v14a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2zm-4 0v2m0 4v2m0 4v2"/></svg>;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        {/* Imagen de fondo */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${Estadiopng})` }} // <-- Aquí puedes poner la ruta a tu imagen
        ></div>
        
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow flex flex-col justify-center">
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto text-center">
            
            {/* Banner de bienvenida */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg mb-8">
              <h1 className="text-3xl md:text-4xl text-gray-800 dark:text-gray-100 font-bold mb-2">Bienvenido a Novasport</h1>
              <p className="text-gray-600 dark:text-gray-300">Gestione eficientemente los horarios y la facturación de su institución.</p>
            </div>

            {/* Tarjetas decorativas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              <DecorativeCard title="Gestión de Horarios" description="Cree, edite y visualice horarios." icon={horariosIcon} />
              <DecorativeCard title="Gestión de Facturas" description="Emita y administre documentos." icon={facturasIcon} />
              <DecorativeCard title="Reportes y Estadísticas" description="Genere informes detallados." icon={reportesIcon} />
            </div>

            {/* Botón central para ir al menú */}
            <div className="mt-8">
              <Link 
                to="/menu"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 px-12 rounded-lg shadow-xl transition-transform duration-300 ease-in-out transform hover:scale-105"
              >
                Ir a Menú
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;