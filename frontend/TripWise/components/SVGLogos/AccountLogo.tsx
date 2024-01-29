import React from "react";
import Svg, { Path } from "react-native-svg";
import ThemeContext from "../../context/ThemeContext";

interface Props {
  focused: boolean;
}

const AccountLogo = ({ focused }: Props) => {
  const { theme } = React.useContext(ThemeContext);
  return (
    <Svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <Path
        d="M7.99219 8.90625C6.88281 8.90625 5.9375 8.47222 5.15625 7.60417C4.375 6.73611 3.98437 5.68576 3.98437 4.45312C3.98437 3.22049 4.375 2.17014 5.15625 1.30208C5.9375 0.434028 6.88281 0 7.99219 0C9.10156 0 10.0469 0.434028 10.8281 1.30208C11.6094 2.17014 12 3.22049 12 4.45312C12 5.68576 11.6094 6.73611 10.8281 7.60417C10.0469 8.47222 9.10156 8.90625 7.99219 8.90625ZM7.99219 11.1458C8.97656 11.1458 10.0625 11.3021 11.25 11.6146C12.4375 11.9271 13.5234 12.4392 14.5078 13.151C15.4922 13.8628 15.9844 14.6701 15.9844 15.5729V17.8125H0V15.5729C0 14.6701 0.492187 13.8628 1.47656 13.151C2.46094 12.4392 3.54687 11.9271 4.73437 11.6146C5.92187 11.3021 7.00781 11.1458 7.99219 11.1458Z"
        fill={focused ? (theme === "Dark" ? "white" : "black") : "grey"}
      />
    </Svg>
  );
};

export default AccountLogo;
