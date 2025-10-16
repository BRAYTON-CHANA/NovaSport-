import React, { useState, useEffect } from 'react';
import { useFormulario, NOMBRE_TABLA_INSTALACIONES } from '../context/FormularioContext';

const GestionInstalacionesModal = ({ isVisible, onClose, instalaciones }) => {
  const { agregarRegistro, actualizarRegistro, eliminarRegistro } = useFormulario();
  const [currentItem, setCurrentItem] = useState({ nombre: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!isVisible) {
        // Resetear el estado cuando el modal se cierra
        setCurrentItem({ nombre: '' });
        setEditId(null);
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setCurrentItem({ nombre: item.nombre });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setCurrentItem({ nombre: '' });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem.nombre || !currentItem.nombre.trim()) {
        alert("El campo 'Nombre' no puede estar vacío.");
        return;
    }
    try {
        const normalizedName = currentItem.nombre.trim();
        // Validar si el nombre ya existe (excluyendo el item que se está editando)
        const isDuplicate = instalaciones.some(inst => 
            inst.nombre.toLowerCase() === normalizedName.toLowerCase() && inst.id !== editId
        );
        if(isDuplicate){
            alert('Ya existe una instalación con ese nombre.');
            return;
        }

        if (editId) {
            await actualizarRegistro(NOMBRE_TABLA_INSTALACIONES, editId, { nombre: normalizedName });
            // alert('Instalación actualizada.'); // Opcional: el feedback visual es suficiente
        } else {
            await agregarRegistro(NOMBRE_TABLA_INSTALACIONES, { nombre: normalizedName });
            // alert('Instalación añadida.');
        }
        handleCancelEdit(); // Resetear formulario tras el éxito
    } catch (error) {
        console.error("Error al guardar la instalación:", error);
        alert("Ocurrió un error al guardar.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta instalación? Los registros existentes no se verán afectados, pero no podrá seleccionarla en el futuro.')) {
        try {
            await eliminarRegistro(NOMBRE_TABLA_INSTALACIONES, id);
            // alert('Instalación eliminada.');
        } catch (error) {
            console.error("Error al eliminar la instalación:", error);
            alert("Ocurrió un error al eliminar.");
        }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">Gestionar Instalaciones</h2>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex items-end gap-2">
            <div className="grow">
              <label htmlFor="nombreInstalacion" className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre de la Instalación</label>
              <input id="nombreInstalacion" type="text" name="nombre" value={currentItem.nombre} onChange={handleInputChange} className="form-input w-full dark:bg-gray-700" placeholder="Ej. Piscina Olímpica" />
            </div>
            <button type="submit" className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap">{editId ? 'Actualizar' : 'Añadir'}</button>
            {editId && <button type="button" onClick={handleCancelEdit} className="btn border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">Cancelar</button>}
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {instalaciones && instalaciones.length > 0 ? instalaciones.map(item => (
                    <li key={item.id} className="py-2 flex justify-between items-center">
                        <span className="dark:text-gray-300">{item.nombre}</span>
                        <div className="flex gap-3">
                            <button onClick={() => handleEdit(item)} className="text-sm font-medium text-indigo-500 hover:text-indigo-700">Editar</button>
                            <button onClick={() => handleDelete(item.id)} className="text-sm font-medium text-red-500 hover:text-red-700">Eliminar</button>
                        </div>
                    </li>
                )) : (
                    <li className="py-4 text-center text-gray-500 dark:text-gray-400">No hay instalaciones definidas.</li>
                )}
            </ul>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default GestionInstalacionesModal;
