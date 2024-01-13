import React, { useState, useMemo } from "react";
import ThemeContext from "./ThemeContext";

const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState("Light"); // Default theme

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
