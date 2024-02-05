import React from "react";
import Svg, { Path } from "react-native-svg";
import ThemeContext from "../../context/ThemeContext";

interface Props {
  focused: boolean;
}

const AppSettingsLogo = ({ focused }: Props) => {
  const { theme } = React.useContext(ThemeContext);
  return (
    <Svg width="20" height="19" viewBox="0 0 27 36" fill="none">
      <Path
        d="M26.7539 19.2109L25.4489 18.18V17.82L26.7221 16.7891C26.9767 16.5927 27.0404 16.2327 26.8812 15.9545L25.5284 13.5327C25.4727 13.4318 25.3916 13.3481 25.2936 13.2905C25.1956 13.2329 25.0843 13.2036 24.9714 13.2055C24.8918 13.2055 24.8122 13.2218 24.7327 13.2545L23.2207 13.8764C23.0934 13.7945 23.0456 13.7618 22.9183 13.6964L22.6796 12.0436C22.661 11.8827 22.5862 11.7343 22.4691 11.6259C22.352 11.5175 22.2005 11.4566 22.0429 11.4545H19.3214C19.0031 11.4545 18.7325 11.7 18.6848 12.0109L18.462 13.6636C18.4142 13.6964 18.3505 13.7127 18.3028 13.7455L18.1596 13.8436L16.6476 13.2218C16.5047 13.1612 16.3452 13.156 16.1989 13.2072C16.0525 13.2584 15.9292 13.3624 15.8518 13.5L14.499 15.9218C14.3398 16.2 14.4035 16.56 14.6582 16.7564L15.9314 17.7873V18.1636L14.6582 19.1945C14.5365 19.2892 14.453 19.4267 14.4237 19.5806C14.3943 19.7345 14.4211 19.8942 14.499 20.0291L15.8518 22.4509C15.9632 22.6636 16.186 22.7782 16.4089 22.7782C16.4884 22.7782 16.568 22.7618 16.6476 22.7291L18.1596 22.1236C18.2869 22.2055 18.3505 22.2382 18.4779 22.3036L18.7166 23.9564C18.7643 24.2836 19.0349 24.5127 19.3532 24.5127H22.0748C22.3931 24.5127 22.6636 24.2673 22.7114 23.9564L22.9501 22.3036C22.9979 22.2709 23.0615 22.2545 23.1093 22.2218L23.2525 22.1236L24.7645 22.7455C24.9074 22.806 25.0668 22.8112 25.2132 22.7601C25.3596 22.7089 25.4829 22.6049 25.5603 22.4673L26.9131 20.0455C26.9909 19.9106 27.0178 19.7509 26.9884 19.597C26.959 19.443 26.8756 19.3056 26.7539 19.2109ZM20.6901 20.4545C19.3691 20.4545 18.3028 19.3582 18.3028 18C18.3028 16.6418 19.3691 15.5455 20.6901 15.5455C22.0111 15.5455 23.0774 16.6418 23.0774 18C23.0774 19.3582 22.0111 20.4545 20.6901 20.4545ZM19.0986 26.1818H22.2817V32.7273C22.2817 34.5273 20.8493 36 19.0986 36H3.1831C1.43239 36 0 34.5273 0 32.7273V3.27273C0 1.47273 1.43239 0 3.1831 0H19.0986C20.8493 0 22.2817 1.47273 22.2817 3.27273V9.81818H19.0986V8.18182H3.1831V27.8182H19.0986V26.1818Z"
        fill={theme === "Dark" ? "white" : "black"}
      />
    </Svg>
  );
};

export default AppSettingsLogo;
