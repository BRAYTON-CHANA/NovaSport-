import React, { useState, useEffect } from 'react';
import { useFormulario, NOMBRE_TABLA_CODIGOS } from '../context/FormularioContext';

const GestionCodigosModal = ({ isVisible, onClose, codigos }) => {
  const { agregarRegistro, actualizarRegistro, eliminarRegistro } = useFormulario();
  const [currentItem, setCurrentItem] = useState({ prefijo: '', ciudad: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    // Si salimos del modo edición, limpiar el formulario
    if (!editId) {
      setCurrentItem({ prefijo: '', ciudad: '' });
    }
  }, [editId]);

  if (!isVisible) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem.prefijo) {
        alert("El campo 'Prefijo' no puede estar vacío.");
        return;
    }
    try {
        if (editId) {
            await actualizarRegistro(NOMBRE_TABLA_CODIGOS, editId, currentItem);
            alert('Prefijo actualizado con éxito.');
        } else {
            await agregarRegistro(NOMBRE_TABLA_CODIGOS, currentItem);
            alert('Prefijo añadido con éxito.');
        }
        setEditId(null);
    } catch (error) {
        console.error("Error al guardar el prefijo:", error);
        alert("Ocurrió un error al guardar.");
    }
  };

  const handleEdit = (codigo) => {
    setEditId(codigo.id);
    setCurrentItem({ prefijo: codigo.prefijo, ciudad: codigo.ciudad });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este prefijo?')) {
        try {
            await eliminarRegistro(NOMBRE_TABLA_CODIGOS, id);
            alert('Prefijo eliminado con éxito.');
        } catch (error) {
            console.error("Error al eliminar el prefijo:", error);
            alert("Ocurrió un error al eliminar.");
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gestionar Prefijos de Documento</h2>
        
        {/* Formulario de Añadir/Editar */}
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Prefijo</label>
              <input type="text" name="prefijo" value={currentItem.prefijo} onChange={handleInputChange} className="form-input w-full dark:bg-gray-700" placeholder="Ej. B017" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Ciudad</label>
              <input type="text" name="ciudad" value={currentItem.ciudad} onChange={handleInputChange} className="form-input w-full dark:bg-gray-700" placeholder="Ej. Cusco" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {editId && <button type="button" onClick={() => setEditId(null)} className="btn border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">Cancelar Edición</button>}
            <button type="submit" className="btn bg-indigo-500 hover:bg-indigo-600 text-white">{editId ? 'Actualizar' : 'Añadir'}</button>
          </div>
        </form>

        {/* Lista de Prefijos */}
        <div className="max-h-60 overflow-y-auto">
            <table className="table-auto w-full dark:text-gray-300">
                <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="p-2">Prefijo</th>
                        <th className="p-2">Ciudad</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {codigos.map(codigo => (
                        <tr key={codigo.id}>
                            <td className="p-2 text-center">{codigo.prefijo}</td>
                            <td className="p-2 text-center">{codigo.ciudad}</td>
                            <td className="p-2 flex justify-center gap-2">
                                <button onClick={() => handleEdit(codigo)} className="text-yellow-500 hover:text-yellow-700">Editar</button>
                                <button onClick={() => handleDelete(codigo.id)} className="text-red-500 hover:text-red-700">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    {codigos.length === 0 && (
                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">No hay prefijos definidos.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="btn bg-gray-500 hover:bg-gray-600 text-white">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default GestionCodigosModal;
