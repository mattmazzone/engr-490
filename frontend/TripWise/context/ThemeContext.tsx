import React, { createContext, useState, useMemo } from "react";

interface ThemeContextType {
  theme: "Light" | "Dark" | null;
  setTheme: React.Dispatch<React.SetStateAction<"Light" | "Dark" | null>>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null, // Default theme
  setTheme: () => {},
});

export default ThemeContext;
