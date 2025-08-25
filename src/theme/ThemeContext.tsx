// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { deepmerge } from "@mui/utils";
import baseTheme from "./index";

interface ThemeContextType {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeToggleContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeToggle = () => {
  const context = useContext(ThemeToggleContext);
  if (!context) throw new Error("useThemeToggle must be used within ThemeToggleProvider");
  return context;
};

export const ThemeToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme(
        deepmerge(baseTheme, {
          palette: {
            mode: isDarkMode ? "dark" : "light",
          },
        })
      ),
    [isDarkMode]
  );

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme, isDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
};
