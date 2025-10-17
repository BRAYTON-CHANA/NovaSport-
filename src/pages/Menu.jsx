
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

// --- Componente de tarjeta con el estilo de Home.jsx ---
const HomeStyleCard = ({ to, title, description, icon }) => {
    return (
        <Link to={to} className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-500/30 mb-4">
                {icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{description}</p>
        </Link>
    );
};

function Menu() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- Iconos con el mismo estilo que en Home.jsx ---
    const eventosIcon = (
        <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    );

    const boletasIcon = (
        <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5h.01" /></svg>
    );

    const reportesIcon = (
        <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm8-14v14a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2zm-4 0v2m0 4v2m0 4v2"/></svg>
    );

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">
                        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-8">Menú Principal</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <HomeStyleCard 
                                to="/gestion-eventos" 
                                title="Gestión de Eventos" 
                                description="Crear, editar y visualizar eventos programados."
                                icon={eventosIcon} 
                            />
                            <HomeStyleCard 
                                to="/gestion-boletas" 
                                title="Gestión de Boletas y Facturas" 
                                description="Emitir y administrar documentos de pago."
                                icon={boletasIcon} 
                            />
                            <HomeStyleCard 
                                to="/reportes" 
                                title="Reportes y Estadísticas" 
                                description="Generar y exportar informes detallados."
                                icon={reportesIcon} 
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Menu;
