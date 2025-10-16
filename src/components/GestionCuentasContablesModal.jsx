import React, { useState, useEffect } from 'react';
import { useFormulario, NOMBRE_TABLA_CUENTAS_CONTABLES } from '../context/FormularioContext';

const GestionCuentasContablesModal = ({ isVisible, onClose }) => {
  const { database, agregarRegistro, actualizarRegistro, eliminarRegistro } = useFormulario();
  const [currentItem, setCurrentItem] = useState({ Codigo: '', Categoria: '', Subcategoria: '' });
  const [editId, setEditId] = useState(null);

  const cuentasContables = database[NOMBRE_TABLA_CUENTAS_CONTABLES] || [];

  useEffect(() => {
    if (!isVisible) {
      setCurrentItem({ Codigo: '', Categoria: '', Subcategoria: '' });
      setEditId(null);
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setCurrentItem({ Codigo: item.Codigo, Categoria: item.Categoria, Subcategoria: item.Subcategoria });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setCurrentItem({ Codigo: '', Categoria: '', Subcategoria: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { Codigo, Categoria, Subcategoria } = currentItem;
    if (!Codigo.trim() || !Categoria.trim() || !Subcategoria.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const isDuplicate = cuentasContables.some(cuenta =>
        cuenta.Codigo.toLowerCase() === Codigo.trim().toLowerCase() &&
        cuenta.Categoria.toLowerCase() === Categoria.trim().toLowerCase() &&
        cuenta.Subcategoria.toLowerCase() === Subcategoria.trim().toLowerCase() &&
        cuenta.id !== editId
      );

      if (isDuplicate) {
        alert('Ya existe una cuenta contable con estos datos.');
        return;
      }
      
      const dataToSave = {
        Codigo: Codigo.trim(),
        Categoria: Categoria.trim(),
        Subcategoria: Subcategoria.trim()
      };

      if (editId) {
        await actualizarRegistro(NOMBRE_TABLA_CUENTAS_CONTABLES, editId, dataToSave);
      } else {
        await agregarRegistro(NOMBRE_TABLA_CUENTAS_CONTABLES, dataToSave);
      }
      handleCancelEdit();
    } catch (error) {
      console.error("Error al guardar la cuenta contable:", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta cuenta contable?')) {
      try {
        await eliminarRegistro(NOMBRE_TABLA_CUENTAS_CONTABLES, id);
      } catch (error) {
        console.error("Error al eliminar la cuenta contable:", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">Gestionar Cuentas Contables</h2>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="Codigo" value={currentItem.Codigo} onChange={handleInputChange} placeholder="Código" className="form-input w-full dark:bg-gray-700" />
            <input name="Categoria" value={currentItem.Categoria} onChange={handleInputChange} placeholder="Categoría" className="form-input w-full dark:bg-gray-700" />
            <input name="Subcategoria" value={currentItem.Subcategoria} onChange={handleInputChange} placeholder="Subcategoría" className="form-input w-full dark:bg-gray-700" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {editId && <button type="button" onClick={handleCancelEdit} className="btn border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">Cancelar</button>}
            <button type="submit" className="btn bg-indigo-500 hover:bg-indigo-600 text-white">{editId ? 'Actualizar' : 'Añadir'}</button>
          </div>
        </form>

        <div className="max-h-80 overflow-y-auto pr-2">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cuentasContables.map(item => (
              <li key={item.id} className="py-2 grid grid-cols-4 gap-4 items-center">
                <span className="dark:text-gray-300 col-span-1">{item.Codigo}</span>
                <span className="dark:text-gray-300 col-span-1">{item.Categoria}</span>
                <span className="dark:text-gray-300 col-span-1">{item.Subcategoria}</span>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => handleEdit(item)} className="text-sm font-medium text-indigo-500 hover:text-indigo-700">Editar</button>
                  <button onClick={() => handleDelete(item.id)} className="text-sm font-medium text-red-500 hover:text-red-700">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default GestionCuentasContablesModal;
