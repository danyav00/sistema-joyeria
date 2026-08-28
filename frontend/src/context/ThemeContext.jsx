import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [modoOscuro, setModoOscuro] = useState(() => {
    const guardado = localStorage.getItem('modoOscuro');
    return guardado !== null ? guardado === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('modoOscuro', modoOscuro);
  }, [modoOscuro]);

  function toggleTema() {
    setModoOscuro((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ modoOscuro, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}