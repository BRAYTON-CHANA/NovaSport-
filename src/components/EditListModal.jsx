import React, { useState, useEffect } from 'react';

function EditListModal({ modalOpen, setModalOpen, title, items, onSave }) {
  const [listItems, setListItems] = useState(items);
  const [newItem, setNewItem] = useState('');

  // Actualizar el estado interno si los items externos cambian
  useEffect(() => {
    setListItems(items);
  }, [items]);

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setListItems([...listItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = listItems.filter((_, i) => i !== index);
    setListItems(updatedItems);
  };

  const handleSave = () => {
    onSave(listItems);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
    // No se revierten los cambios aquí para permitir cerrar y abrir sin perder el progreso
  }

  // Efecto para cerrar con la tecla Escape
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!modalOpen || keyCode !== 27) return;
      handleCancel();
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  if (!modalOpen) return null;

  return (
    // Fondo del modal con efecto de desenfoque (glassmorphism)
    <div 
      className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm z-50 flex justify-center items-start pt-16 sm:pt-20" 
      onClick={handleCancel}
    >
      <div 
        className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>
        
        {/* Lista de Items */}
        <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
          {listItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100/80 dark:bg-gray-700/80 p-2 rounded">
              <span className="text-gray-800 dark:text-gray-200">{item}</span>
              <button onClick={() => handleRemoveItem(index)} className="text-rose-500 hover:text-rose-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                  <path d="M15 1L1 15M1 1l14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
          ))}
          {listItems.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">La lista está vacía.</p>
          )}
        </div>

        {/* Añadir Nuevo Item */}
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="form-input w-full dark:bg-gray-700/80" 
            placeholder="Añadir nuevo valor..."
            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); } }}
          />
          <button onClick={handleAddItem} className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap">Añadir</button>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <button onClick={handleCancel} className="btn bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
          <button onClick={handleSave} className="btn bg-emerald-500 hover:bg-emerald-600 text-white">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}

export default EditListModal;
