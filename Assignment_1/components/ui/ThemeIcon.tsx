import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

type Props = {
    mode: "light" | "dark";
    size?: number;
    color?: string;
};

export function ThemeIcon({ mode, size = 20, color = "#000" }: Props) {
    if (mode === "light") {
        // Sun
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
                <Path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                />
            </Svg>
        );
    }

    // Moon
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
