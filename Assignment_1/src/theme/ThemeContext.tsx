import React, { createContext, useContext, useMemo, useState } from "react";
import { Colors, type ThemeColors } from "@/constants/theme";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
    mode: ThemeMode;
    setMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
    colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("light");

    const colors = useMemo<ThemeColors>(() => Colors[mode], [mode]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }
    return ctx;
}
