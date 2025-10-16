import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">
            {/* Welcome banner */}
            <div className="relative bg-gradient-to-r from-indigo-500 to-blue-500 p-4 sm:p-6 rounded-2xl overflow-hidden mb-8">
              <div className="relative">
                <h1 className="text-2xl md:text-3xl text-white font-bold mb-2">Bienvenido a Novasport</h1>
                <p className="text-indigo-100">Gestione eficientemente los horarios y la facturación de su institución.</p>
              </div>
            </div>

            {/* Dashboard actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Gestión de Horarios */}
              <Link to="/menu" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-500/30 mb-4">
                  <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Gestión de Horarios</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">Cree, edite y visualice los horarios de los espacios deportivos.</p>
              </Link>

              {/* Gestión de Facturas */}
              <Link to="/menu" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-500/30 mb-4">
                  <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5h.01" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Gestión de Facturas</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">Emita y administre boletas y facturas de la institución.</p>
              </Link>

              {/* Reportes */}
              <Link to="/reportes" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-500/30 mb-4">
                  <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm8-14v14a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2zm-4 0v2m0 4v2m0 4v2"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Reportes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">Genere y exporte reportes detallados de su gestión.</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
