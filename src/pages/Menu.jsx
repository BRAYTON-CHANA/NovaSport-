
      import React, { useState } from 'react';
      import { Link } from 'react-router-dom'; // <- Importar Link
      import Sidebar from '../partials/Sidebar';
      import Header from '../partials/Header';
      
      // Componente de tarjeta para la página de inicio, ahora con enlace opcional
      const HomeCard = ({ to, title, description, icon }) => {
          const content = (
             <div className="block bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                 <div className="flex items-center">
                     <div className="mr-4">
                         {icon}
                     </div>
                     <div>
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                     </div>
                 </div>
             </div>
          );
      
          // Si se proporciona 'to', envuelve el contenido en un Link
          if (to) {
              return <Link to={to}>{content}</Link>;
          }
          
          // De lo contrario, muestra el div con cursor de puntero para indicar que es clickeable
          return <div className="cursor-pointer">{content}</div>;
      };
      
      function Menu() { // <--- Renombrado de Home a Menu
          const [sidebarOpen, setSidebarOpen] = useState(false);
      
          // Icono para Eventos (Calendario)
          const eventosIcon = (
              <svg className="shrink-0 fill-current text-violet-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                  <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2Zm2-1h10v1H3V1ZM3 4v2h2V4H3Zm3 0v2h2V4H6Zm3 0v2h2V4H9Zm-6 3v2h2V7H3Zm3 0v2h2V7H6Zm3 0v2h2V7H9Z" />
              </svg>
          );
      
          // Icono para Boletas y Facturas (Documento)
          const boletasIcon = (
              <svg className="shrink-0 fill-current text-violet-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                  <path d="M3 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H3Zm0 2h10v2H3V2Zm0 4h10v8H3V6Zm2 2h6v1H5V8Zm0 2h4v1H5v-1Z" />
              </svg>
          );
          
          // Icono para Reportes (Gráfico)
          const reportesIcon = (
            <svg className="shrink-0 fill-current text-violet-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                <path d="M1 1v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V1a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2Zm3 11V7h2v5H4Zm3 0V4h2v8H7Zm3 0V9h2v3h-2Z"/>
            </svg>
          );
      
          return (
              <div className="flex h-screen overflow-hidden">
                  <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                  <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                      <main className="grow">
                          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
                              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-8">Menú Principal</h1>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <HomeCard to="/gestion-eventos" title="Gestión de Eventos" description="Crear, editar y visualizar eventos." icon={eventosIcon} />
                                  <HomeCard to="/gestion-boletas" title="Gestión de Boletas y Facturas" description="Emitir y administrar documentos." icon={boletasIcon} />
                                  <HomeCard to="/reportes" title="Reportes" description="Generar y exportar reportes." icon={reportesIcon} />
                              </div>
                          </div>
                      </main>
                  </div>
              </div>
          );
      }
      
      export default Menu;
