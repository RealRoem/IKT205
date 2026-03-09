import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

type IconProps = {
    size?: number;
    color?: string;
};

type ThemeIconProps = IconProps & {
    mode: "light" | "dark";
};

export function ThemeIcon({ mode, size = 20, color = "#000" }: ThemeIconProps) {
    if (mode === "light") {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
                <Path
                    d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </Svg>
        );
    }

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

export function MenuIcon({ size = 22, color = "#000" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M4 6h16M4 12h16M4 18h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
    );
}

export function AccountIcon({ size = 20, color = "#000" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
            <Path d="M4 20a8 8 0 0 1 16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
    );
}

export function LoginIcon({ size = 20, color = "#000" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M10 17l5-5-5-5M15 12H3M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export function SignOutIcon({ size = 20, color = "#000" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M14 7l5 5-5 5M19 12H7M11 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
