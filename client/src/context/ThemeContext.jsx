import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { flushSync } from "react-dom";

const ThemeContext = createContext(null);

export const useTheme = () => {
    const ctx = useContext(ThemeContext);

    if (!ctx) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return ctx;
};

const STORAGE_KEY = "thequad:theme";

function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
    } else {
        root.classList.remove("light");
        root.classList.add("dark");
    }

    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
        meta.setAttribute("content", theme === "light" ? "#f4efe3" : "#0c0e13");
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "dark";

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === "light" || stored === "dark") return stored;

        return "dark";
    });

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggle = useCallback(() => {
        if (!document.startViewTransition) {
            setTheme((t) => (t === "light" ? "dark" : "light"));
            return;
        }

        document.startViewTransition(() => {
            flushSync(() => {
                setTheme((t) => (t === "light" ? "dark" : "light"));
            });
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}
