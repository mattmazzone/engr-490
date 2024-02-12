import React from 'react';
import Svg, { Path } from 'react-native-svg';
import ThemeContext from "../../context/ThemeContext";
interface IconProps {
  color?: string;
  size?: number | string; // Allowing both number and string types for size
}

const IconLogout: React.FC<IconProps> = ({ color = 'currentColor', size = 24 }) => {
    const { theme } = React.useContext(ThemeContext);
  // Directly applying `color` and `size` to the Svg and Path components
  return (
    <Svg fill="none" viewBox="0 0 15 15" height={size} width={size}>
      <Path
        stroke= {theme === "Dark" ? "white" : "black"} 
        d="M13.5 7.5l-3 3.25m3-3.25l-3-3m3 3H4m4 6H1.5v-12H8"
      />
    </Svg>
  );
};

export default IconLogout;
