import React from 'react';

function SaveNotification({ open, onSave, onDiscard }) {
  if (!open) {
    return null;
  }

  return (
    <>
      {
        <div className="fixed bottom-0 right-0 w-full md:bottom-8 md:right-12 md:w-auto z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
                Tienes cambios sin guardar.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={onSave}
                  className="btn-sm bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={onDiscard}
                  className="btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default SaveNotification;
