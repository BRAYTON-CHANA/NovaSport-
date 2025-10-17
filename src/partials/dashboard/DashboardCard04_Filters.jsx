import React, { useState, useRef, useEffect, useMemo } from 'react';
import Transition from '../../utils/Transition';

function DashboardCard04_Filters({ groupedSubcategories, onFilterChange }) {
  const [viewMode, setViewMode] = useState('category');
  
  // Genera una lista plana de todas las subcategorías para el estado inicial
  const allSubcategories = useMemo(() => Object.values(groupedSubcategories).flat(), [groupedSubcategories]);
  const [selectedSubcategories, setSelectedSubcategories] = useState(new Set(allSubcategories));
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // Resetea la selección si las subcategorías cambian
  useEffect(() => {
    setSelectedSubcategories(new Set(allSubcategories));
  }, [allSubcategories]);

  // Notifica al componente padre sobre cualquier cambio en los filtros
  useEffect(() => {
    onFilterChange(viewMode, Array.from(selectedSubcategories));
  }, [viewMode, selectedSubcategories]);

  const handleModeChange = (newMode) => setViewMode(newMode);

  const handleSubcategoryChange = (subcategory, isChecked) => {
    setSelectedSubcategories(prev => {
      const newSet = new Set(prev);
      if (isChecked) newSet.add(subcategory);
      else newSet.delete(subcategory);
      return newSet;
    });
  };
  
  // Cierra el menú desplegable si se hace clic fuera de él
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current || !trigger.current) return;
      if (dropdownOpen && !dropdown.current.contains(target) && !trigger.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  return (
    <div className="flex items-center space-x-4">
      {/* Interruptor (Switch) más grande */}
      <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1">
        <button
          onClick={() => handleModeChange('category')}
          className={`px-4 py-2 text-base font-semibold rounded-full ${viewMode === 'category' ? 'bg-white dark:bg-gray-800 shadow-md' : 'text-gray-600 dark:text-gray-300'}`}>
          Categoría
        </button>
        <button
          onClick={() => handleModeChange('subcategory')}
          className={`px-4 py-2 text-base font-semibold rounded-full ${viewMode === 'subcategory' ? 'bg-white dark:bg-gray-800 shadow-md' : 'text-gray-600 dark:text-gray-300'}`}>
          Subcategoría
        </button>
      </div>

      {/* Botón de filtro y Menú Desplegable (Dropdown) */}
      <div className="relative inline-flex">
        <button
          ref={trigger}
          disabled={viewMode === 'category'}
          className="btn bg-white dark:bg-gray-800 border-gray-200 hover:border-gray-300 dark:border-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400"
          onClick={() => setDropdownOpen(!dropdownOpen)} >
          <span className="sr-only">Filtrar Subcategorías</span>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
            <path d="M0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1ZM3 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM7 12a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Z" />
          </svg>
        </button>

        <Transition
          show={dropdownOpen && viewMode === 'subcategory'}
          tag="div"
          className="origin-top-right z-10 absolute top-full right-0 min-w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 pt-1.5 rounded-lg shadow-lg overflow-y-auto max-h-96 mt-1"
        >
          <div ref={dropdown}>
            <div className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-4">
              Seleccionar Subcategorías
            </div>
            <ul className="mb-4">
              {Object.entries(groupedSubcategories).map(([category, subcategories]) => (
                <React.Fragment key={category}>
                  <li className="px-4 py-2 border-t border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/20">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{category}</span>
                  </li>
                  {subcategories.map(sub => (
                    <li key={sub} className="py-2 px-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-500"
                          checked={selectedSubcategories.has(sub)}
                          onChange={(e) => handleSubcategoryChange(sub, e.target.checked)}
                        />
                        <span className="text-base font-medium ml-3 dark:text-gray-100">{sub}</span>
                      </label>
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
            <div className="py-2 px-3 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/20">
              <button
                  className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                  onClick={() => setDropdownOpen(false)} >
                  Aplicar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

export default DashboardCard04_Filters;
