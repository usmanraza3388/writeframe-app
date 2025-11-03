// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'default' | 'dim' | 'sepia';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('default');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Apply theme to document root and update CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('theme-default', 'theme-dim', 'theme-sepia');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', theme);
    
    // Update dark mode state for component logic
    setIsDark(theme === 'dim');

    // Set CSS variables based on theme
    switch (theme) {
      case 'dim':
        root.style.setProperty('--background-primary', '#1A1A1A');
        root.style.setProperty('--background-secondary', '#2D2D2D');
        root.style.setProperty('--background-card', '#2D2D2D');
        root.style.setProperty('--text-primary', '#FFFFFF');
        root.style.setProperty('--text-secondary', '#CCCCCC');
        root.style.setProperty('--border-color', '#404040');
        break;
        
      case 'sepia':
        root.style.setProperty('--background-primary', '#F5EBDC');
        root.style.setProperty('--background-secondary', '#E8D9C5');
        root.style.setProperty('--background-card', '#E8D9C5');
        root.style.setProperty('--text-primary', '#5C4B37');
        root.style.setProperty('--text-secondary', '#7A674F');
        root.style.setProperty('--border-color', '#D4BFA0');
        break;
        
      default:
        // Original colors
        root.style.setProperty('--background-primary', '#FFFFFF');
        root.style.setProperty('--background-secondary', '#FAF8F2');
        root.style.setProperty('--background-card', '#FAF8F2');
        root.style.setProperty('--text-primary', '#1A1A1A');
        root.style.setProperty('--text-secondary', '#666666');
        root.style.setProperty('--border-color', '#E5E5E5');
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};