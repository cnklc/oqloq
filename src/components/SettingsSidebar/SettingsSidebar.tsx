/**
 * Settings Sidebar Component
 * Right side sliding panel for application settings
 */

import React, { useState } from "react";
import { getTheme, setTheme, type ThemeMode } from "../../services/themeService";
import "./SettingsSidebar.css";

interface SettingsSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose }) => {
	const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => getTheme());

	const handleThemeChange = (theme: ThemeMode) => {
		setTheme(theme);
		setCurrentTheme(theme);
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
