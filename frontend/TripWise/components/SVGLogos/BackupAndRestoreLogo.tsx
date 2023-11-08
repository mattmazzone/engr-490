import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  focused: boolean;
}

const BackupAndRestoreLogo = ({ focused }: Props) => {
  return (
    <Svg width="33" height="32" viewBox="0 0 33 32" fill="none">
      <Path
        d="M24.5063 1.74995C32.1804 5.77135 35.207 15.4347 31.2821 23.2975C27.3572 31.1602 17.9452 34.2613 10.2516 30.2399C6.73696 28.3957 4.04124 25.2473 2.71424 21.4368L5.91666 19.3761C6.36509 20.9841 7.13001 22.4811 8.16434 23.7748C9.19868 25.0685 10.4805 26.1317 11.9309 26.8987C17.8085 29.9798 24.9944 27.599 28.0016 21.5769C28.7345 20.1459 29.1834 18.5803 29.3224 16.9706C29.4614 15.3608 29.2877 13.7388 28.8113 12.1983C28.335 10.6577 27.5654 9.22914 26.547 7.99507C25.5287 6.76101 24.2818 5.74591 22.8784 5.00844C21.4749 4.27096 19.9428 3.82573 18.3704 3.69845C16.7981 3.57117 15.2167 3.76437 13.7176 4.26689C12.2186 4.76942 10.8315 5.5713 9.63671 6.62621C8.44187 7.68113 7.46288 8.96817 6.75631 10.413L10.4274 12.3536L0.76155 18.5158L0 6.87174L3.47579 8.69237C7.42023 0.789616 16.8908 -2.23144 24.5063 1.74995ZM15.9925 17.4154C15.8113 17.2287 15.668 17.007 15.5708 16.7632C15.4736 16.5194 15.4245 16.2583 15.4263 15.9949C15.4263 15.8549 15.4848 15.7548 15.5044 15.6148H15.4848L17.379 5.99143L19.2731 15.6148L25.1897 21.997L16.4026 17.7555L16.4417 17.7155C16.2854 17.6355 16.1292 17.5355 15.9925 17.4154Z"
        fill="white"
      />
    </Svg>
  );
};

export default BackupAndRestoreLogo;