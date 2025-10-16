
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

const ReportCard = ({ to, title, description, icon }) => (
    <Link to={to} className="block bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <div className="flex items-center">
            <div className="mr-4">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
    </Link>
);

function Reportes() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const dashboardIcon = (
        <svg className="shrink-0 fill-current text-violet-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
            <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
            <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
        </svg>
    );

    const horariosIcon = (
        <svg className="shrink-0 fill-current text-violet-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM8 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" />
            <path d="M7.5 3h1v5.436l3.232 1.866-.5 1.732L7.5 9.436V3Z" />
        </svg>
    );

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        <div className="sm:flex sm:justify-between sm:items-center mb-8">
                            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Reportes</h1>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReportCard 
                                to="/dashboard" // <- Corregido: apunta a /dashboard
                                title="Dashboard Principal"
                                description="Visualiza ingresos, eventos y estadísticas clave."
                                icon={dashboardIcon}
                            />
                            <ReportCard 
                                to="/horarios"
                                title="Visor de Horarios"
                                description="Consulta la programación y disponibilidad de espacios."
                                icon={horariosIcon}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Reportes;
