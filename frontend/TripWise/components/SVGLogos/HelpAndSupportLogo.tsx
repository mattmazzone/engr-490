import React from "react";
import Svg, { Path } from "react-native-svg";
import ThemeContext from "../../context/ThemeContext";
interface Props {
  focused: boolean;
}

const HelpAndSupportLogo = ({ focused }: Props) => {
  const { theme } = React.useContext(ThemeContext);
  return (
    <Svg width="35" height="38" viewBox="0 0 35 38" fill="none">
      <Path
        d="M24.2187 0.312511C18.2659 0.312511 13.4687 5.44439 13.4687 11.8125C13.4687 12.1503 13.5185 12.6074 13.5534 13.0258L2.04687 25.3336C1.41835 26.0017 0.91954 26.7961 0.579156 27.6711C0.238773 28.5462 0.0635376 29.4846 0.0635376 30.4324C0.0635376 31.3803 0.238773 32.3187 0.579156 33.1938C0.91954 34.0688 1.41835 34.8632 2.04687 35.5313C2.67132 36.2036 3.41392 36.7372 4.23192 37.1014C5.04992 37.4655 5.92716 37.653 6.81315 37.653C7.69914 37.653 8.57639 37.4655 9.39439 37.1014C10.2124 36.7372 10.955 36.2036 11.5794 35.5313L23.0846 23.2219C23.4743 23.2593 23.9043 23.3125 24.2187 23.3125C30.1716 23.3125 34.9687 18.1806 34.9687 11.8125C34.9758 9.95957 34.5421 8.13517 33.7083 6.51101L32.8685 4.84926L31.6094 6.19764L25.8138 12.3501L23.7148 10.1048L29.4661 3.90626L30.7292 2.55789L29.1745 1.65945C27.6557 0.769245 25.9506 0.305808 24.2187 0.312511ZM24.2187 3.18751C24.8718 3.18751 25.3582 3.48939 25.9387 3.63745L20.8594 9.0712L19.8919 10.1062L20.8594 11.0938L24.8906 15.4063L25.8151 16.4413L26.7799 15.4063L31.862 9.97251C32.0004 10.5935 32.2812 11.1139 32.2812 11.8125C32.2812 16.6569 28.7472 20.4375 24.2187 20.4375C23.6812 20.4375 23.2512 20.4375 22.9153 20.3469L22.2031 20.1227L21.6576 20.7078L9.68878 33.5116C8.03597 35.2797 5.59034 35.2797 3.93753 33.5116L3.89453 33.4656C2.28203 31.6974 2.29547 29.1099 3.93484 27.3562L15.9036 14.5538L16.4505 13.9702L16.2382 13.2083C16.1576 12.8489 16.1549 12.3889 16.1549 11.8139C16.1549 6.96957 19.689 3.18895 24.2174 3.18895L24.2187 3.18751Z"
        fill={theme === "Dark" ? "white" : "black"}
      />
    </Svg>
  );
};

export default HelpAndSupportLogo;
