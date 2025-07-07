import { createContext, useState } from 'react';

export const ThemeContext = createContext(null);

export function ThemeContextProvider({ children }) {
  const [isDark, setDark] = useState(false);

  const themeClasses = isDark
    ? 'bg-gray-900 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  const bodyThemeClasses = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const searchBgClasses = isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300';
  const dynamicFontColor = isDark ? 'text-gray-300' : 'text-gray-400';

  return (
    <ThemeContext.Provider
      value={{ isDark, setDark, themeClasses, bodyThemeClasses, searchBgClasses, dynamicFontColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
