/**
 * Settings Sidebar Component
 * Right side sliding panel for application settings
 */

import React, { useState } from "react";
import { getTheme, setTheme, type ThemeMode } from "../../services/themeService";
import {
	getPomodoroSettings,
	savePomodoroSettings,
	type PomodoroSettings,
} from "../../services/pomodoroService";
import "./SettingsSidebar.css";

interface SettingsSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose }) => {
	const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => getTheme());
	const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(() =>
		getPomodoroSettings()
	);

	const handleThemeChange = (theme: ThemeMode) => {
		setTheme(theme);
		setCurrentTheme(theme);
	};

	const handlePomodoroSettingChange = (key: keyof PomodoroSettings, value: number) => {
		const newSettings = { ...pomodoroSettings, [key]: value };
		setPomodoroSettings(newSettings);
		savePomodoroSettings(newSettings);
	};

	return (
		<>
			{/* Overlay for mobile and backdrop */}
			{isOpen && <div className="settings-overlay" onClick={onClose} />}

			{/* Settings Sidebar */}
			<div className={`settings-sidebar ${isOpen ? "open" : ""}`}>
				<div className="settings-header">
					<h2>Settings</h2>
					<button className="close-btn" onClick={onClose} aria-label="Close settings">
						✕
					</button>
				</div>

				<div className="settings-content">
					{/* General Settings */}
					<div className="settings-section">
						<h3>General</h3>

						{/* Site Title */}
						<div className="setting-item">
							<label htmlFor="site-title">Site Title</label>
							<input
								type="text"
								id="site-title"
								placeholder="Enter site title"
								defaultValue="Oqloq"
								onChange={(e) => {
									localStorage.setItem("siteTitle", e.target.value);
								}}
							/>
						</div>

						{/* 24-Hour Format */}
						<div className="setting-item">
							<label htmlFor="time-format">
								<input
									type="checkbox"
									id="time-format"
									defaultChecked={true}
									onChange={(e) => {
										localStorage.setItem("use24HourFormat", String(e.target.checked));
									}}
								/>
								Use 24-Hour Format
							</label>
						</div>
					</div>

					{/* Display Settings */}
					<div className="settings-section">
						<h3>Display</h3>

						{/* Theme */}
						<div className="setting-item">
							<label htmlFor="theme">Theme</label>
							<select
								id="theme"
								value={currentTheme}
								onChange={(e) => {
									handleThemeChange(e.target.value as ThemeMode);
								}}
							>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
								<option value="auto">Auto</option>
							</select>
						</div>

						{/* Clock Size */}
						<div className="setting-item">
							<label htmlFor="clock-size">Clock Size</label>
							<select
								id="clock-size"
								defaultValue="medium"
								onChange={(e) => {
									localStorage.setItem("clockSize", e.target.value);
								}}
							>
								<option value="small">Small</option>
								<option value="medium">Medium</option>
								<option value="large">Large</option>
							</select>
						</div>
					</div>

					{/* Pomodoro Settings */}
					<div className="settings-section">
						<h3>Pomodoro</h3>

						{/* Work Duration */}
						<div className="setting-item">
							<label htmlFor="work-duration">
								Work Duration (minutes)
								<span className="setting-value">{pomodoroSettings.workDuration}</span>
							</label>
							<input
								type="range"
								id="work-duration"
								min="1"
								max="60"
								value={pomodoroSettings.workDuration}
								onChange={(e) =>
									handlePomodoroSettingChange("workDuration", Number(e.target.value))
								}
							/>
						</div>

						{/* Short Break */}
						<div className="setting-item">
							<label htmlFor="short-break">
								Short Break (minutes)
								<span className="setting-value">{pomodoroSettings.shortBreak}</span>
							</label>
							<input
								type="range"
								id="short-break"
								min="1"
								max="30"
								value={pomodoroSettings.shortBreak}
								onChange={(e) => handlePomodoroSettingChange("shortBreak", Number(e.target.value))}
							/>
						</div>

						{/* Long Break */}
						<div className="setting-item">
							<label htmlFor="long-break">
								Long Break (minutes)
								<span className="setting-value">{pomodoroSettings.longBreak}</span>
							</label>
							<input
								type="range"
								id="long-break"
								min="5"
								max="60"
								value={pomodoroSettings.longBreak}
								onChange={(e) => handlePomodoroSettingChange("longBreak", Number(e.target.value))}
							/>
						</div>

						{/* Long Break Interval */}
						<div className="setting-item">
							<label htmlFor="long-break-interval">
								Long Break After (pomodoros)
								<span className="setting-value">{pomodoroSettings.longBreakInterval}</span>
							</label>
							<input
								type="range"
								id="long-break-interval"
								min="2"
								max="10"
								value={pomodoroSettings.longBreakInterval}
								onChange={(e) =>
									handlePomodoroSettingChange("longBreakInterval", Number(e.target.value))
								}
							/>
						</div>
					</div>

					{/* Data Settings */}
					<div className="settings-section">
						<h3>Data</h3>

						{/* Auto-save */}
						<div className="setting-item">
							<label htmlFor="auto-save">
								<input
									type="checkbox"
									id="auto-save"
									defaultChecked={true}
									onChange={(e) => {
										localStorage.setItem("autoSave", String(e.target.checked));
									}}
								/>
								Auto-save Changes
							</label>
						</div>

						{/* Export Data */}
						<div className="setting-item">
							<button
								className="btn btn-secondary"
								onClick={() => {
									// Export functionality can be implemented
									alert("Export feature coming soon");
								}}
								style={{ width: "100%", marginTop: "8px" }}
							>
								📥 Export Data
							</button>
						</div>

						{/* Import Data */}
						<div className="setting-item">
							<button
								className="btn btn-secondary"
								onClick={() => {
									// Import functionality can be implemented
									alert("Import feature coming soon");
								}}
								style={{ width: "100%", marginTop: "8px" }}
							>
								📤 Import Data
							</button>
						</div>

						{/* Clear Data */}
						<div className="setting-item">
							<button
								className="btn btn-danger"
								onClick={() => {
									if (
										confirm("Are you sure? This will delete all your data and cannot be undone.")
									) {
										localStorage.clear();
										alert("All data cleared. Page will reload.");
										window.location.reload();
									}
								}}
								style={{ width: "100%" }}
							>
								🗑️ Clear All Data
							</button>
						</div>
					</div>

					{/* About */}
					<div className="settings-section">
						<h3>About</h3>
						<div className="about-info">
							<p>
								<strong>Oqloq</strong>
								<br />
								24-Hour Creative Routine Clock
							</p>
							<p className="version">Version 1.0.0</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
