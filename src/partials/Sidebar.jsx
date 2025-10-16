import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoNovasport from "../images/logoNovasport.png";

// COMPONENTE PARA GRUPOS DE ENLACES
function SidebarLinkGroup({ children, activecondition }) {
  const [open, setOpen] = useState(activecondition);

  useEffect(() => {
    setOpen(activecondition);
  }, [activecondition]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${
        activecondition && "bg-indigo-100 dark:bg-indigo-500/20"
      }`}>
      {children(handleClick, open)}
    </li>
  );
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}>
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <NavLink end to="/" className="block">
            <div className="flex items-center">
                <img className="dark:brightness-0 dark:invert" src={logoNovasport} alt="Novasport Logo" width="64" height="64" />
                <span className="text-lg font-semibold ml-3 text-gray-800 dark:text-gray-100 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Novasport</span>
            </div>
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">•••</span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Pages</span>
            </h3>
            <ul className="mt-3">
              {/* Inicio */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${pathname === '/' && "bg-indigo-100 dark:bg-indigo-500/20"}`}>
                <NavLink end to="/" className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname !== '/' && "hover:text-gray-900 dark:hover:text-white"}`}>
                  <div className="flex items-center">
                    <svg className={`shrink-0 fill-current ${pathname === '/' ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M2 8.586 8 2.586l6 6V14H2V8.586Zm1-1.172L8 2l5 5v6H3V7.414ZM9 13H7v-2h2v2Z"/></svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Inicio</span>
                  </div>
                </NavLink>
              </li>

              {/* Menu */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${pathname === '/menu' && "bg-indigo-100 dark:bg-indigo-500/20"}`}>
                <NavLink end to="/menu" className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname !== '/menu' && "hover:text-gray-900 dark:hover:text-white"}`}>
                  <div className="flex items-center">
                    <svg className={`shrink-0 fill-current ${pathname === '/menu' ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M1 1v14h14V1H1Zm2 12H2v-2h1v2Zm0-3H2v-2h1v2Zm0-3H2v-2h1v2Zm0-3H2V4h1v2Zm3 3H5V2h1v8Zm3 0H8V5h1v5Zm3 0h-1V8h1v2Z"/></svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Menu</span>
                  </div>
                </NavLink>
              </li>

              {/* Reportes */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${pathname.startsWith('/reportes') && "bg-indigo-100 dark:bg-indigo-500/20"}`}>
                <NavLink end to="/reportes" className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${!pathname.startsWith('/reportes') && "hover:text-gray-900 dark:hover:text-white"}`}>
                    <div className="flex items-center">
                        <svg className={`shrink-0 fill-current ${pathname.startsWith('/reportes') ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M3 13H1V1h2v12Zm4-4H5V1h2v8Zm4-4H9V1h2v4Z"/>
                        </svg>
                        <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Reportes</span>
                    </div>
                </NavLink>
              </li>

              {/* Base de datos */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${pathname.startsWith('/database') && "bg-indigo-100 dark:bg-indigo-500/20"}`}>
                <NavLink end to="/database" className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.startsWith('/database') ? "" : "hover:text-gray-900 dark:hover:text-white"}`}>
                  <div className="flex items-center">
                    <svg className={`shrink-0 fill-current ${pathname.startsWith('/database') ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm0 2h12v2H2V4zm0 4h12v2H2V8z"/>
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Base de datos</span>
                  </div>
                </NavLink>
              </li>

              {/* Backups */}
              <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${pathname.startsWith('/backups') && "bg-indigo-100 dark:bg-indigo-500/20"}`}>
                <NavLink end to="/backups" className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.startsWith('/backups') ? "" : "hover:text-gray-900 dark:hover:text-white"}`}>
                  <div className="flex items-center"><svg className={`shrink-0 fill-current ${pathname.startsWith('/backups') ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm0 2h12v2H2V4zm5 4h2v2H7V8z"/></svg><span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Backups</span></div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}><span className="sr-only">Expand / collapse sidebar</span><svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
