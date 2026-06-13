import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import "./ThemeToggle.css";

export const ThemeToggle: React.FC = () => {
	const [isDark, setIsDark] = useState(() => {
		const saved = localStorage.getItem("oqlock-theme");
		if (saved) return saved === "dark";
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	useEffect(() => {
		const root = window.document.documentElement;
		if (isDark) {
			root.classList.add("theme-dark");
			localStorage.setItem("oqlock-theme", "dark");
		} else {
			root.classList.remove("theme-dark");
			localStorage.setItem("oqlock-theme", "light");
		}
	}, [isDark]);

	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className="theme-toggle-btn"
			onClick={() => setIsDark(!isDark)}
			aria-label="Toggle theme"
		>
			<motion.div
				initial={false}
				animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0 }}
				style={{ position: "absolute" }}
			>
				<Moon size={20} />
			</motion.div>
			<motion.div
				initial={false}
				animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
			>
				<Sun size={20} />
			</motion.div>
		</motion.button>
	);
};
