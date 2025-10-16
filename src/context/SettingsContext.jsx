import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

const initialSettings = {
  darkMode: false,
  backupInterval: 15,
  comboValues: {
    // 'instalaciones' ya no se gestiona aquí.
    tiposEvento: ['Deportivo', 'Cultural', 'Académico'],
    motivos: ['Competencia', 'Entrenamiento', 'Recreativo'],
    espaciosDeportivos: ['Cancha Principal', 'Pista Atlética', 'Gimnasio Anexo'],
  },
};

/**
 * Carga la configuración de forma segura desde el LocalStorage.
 */
const loadSettingsFromStorage = () => {
  try {
    const storedSettings = window.localStorage.getItem('app-settings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      if (parsed && typeof parsed === 'object') {
        // Fusionar para asegurar que no falten propiedades y limpiar 'instalaciones' si aún existe.
        const mergedComboValues = { ...initialSettings.comboValues, ...(parsed.comboValues || {}) };
        delete mergedComboValues.instalaciones; // Limpieza explícita

        return {
          ...initialSettings,
          ...parsed,
          comboValues: mergedComboValues,
        };
      }
    }
  } catch (error) {
    console.error("Error al cargar la configuración del LocalStorage", error);
  }
  return initialSettings;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadSettingsFromStorage);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prevSettings => {
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
        comboValues: { ...prevSettings.comboValues, ...(newSettings.comboValues || {}) },
      };

      try {
        window.localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error("No se pudo guardar la configuración en el LocalStorage", error);
      }

      return updatedSettings;
    });
  }, []);

  const value = {
    settings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings debe ser usado dentro de un SettingsProvider');
  }
  return context;
};
