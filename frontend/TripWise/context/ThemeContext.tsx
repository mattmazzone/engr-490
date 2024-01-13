import React, { createContext, useState, useMemo } from "react";

const ThemeContext = createContext({
  theme: "Light", // Default theme
  setTheme: (theme: string) => {},
});

export default ThemeContext;
