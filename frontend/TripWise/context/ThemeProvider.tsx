import React, { useState, useMemo, useEffect } from "react";
import ThemeContext from "./ThemeContext";
import { useUserProfile } from "../hooks/useUserProfile";

const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<"Light" | "Dark" | null>(null); // Updated initial state
  const { userProfile } = useUserProfile({ refreshData: false });

  useEffect(() => {
    if (
      userProfile &&
      userProfile.settings &&
      userProfile.settings.backgroundTheme
    ) {
      const userTheme = userProfile.settings.backgroundTheme;
      setTheme(userTheme ? "Dark" : "Light");
    }
  }, [userProfile]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
