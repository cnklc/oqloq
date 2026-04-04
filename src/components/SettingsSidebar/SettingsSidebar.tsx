/**
 * Settings Sidebar Component
 * Right side sliding panel for application settings
 */

import React, { useState } from "react";
import {
	getPomodoroSettings,
	savePomodoroSettings,
	type PomodoroSettings,
} from "../../services/pomodoroService";
import { useRoutineStore } from "../../hooks/useRoutineStore";
import { useAppearanceStore } from "../../hooks/useAppearanceStore";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { X, Download, Upload, Trash2, Code, ExternalLink, Palette, RotateCcw, Timer, Pipette } from "lucide-react";
import "./SettingsSidebar.css";

const BG_PRESETS = [
	"#FFD200", // Oqloq Yellow
	"#F2F2F7", // iOS Grey
	"#000000", // Pitch Black
	"#2C3E50", // Midnight Blue
	"#E8F5E9", // Mint Green
	"#FFF0F0", // Soft Rose
];

const CLOCK_PRESETS = [
	"#ffffff", // Pure White
	"#FDFCF0", // Cream
	"#FFEB3B", // Vivid Yellow
	"#E1F5FE", // Sky Blue
	"#1C1C1E", // Dark Slate
	"transparent" // Ghost mode
];

interface SettingsSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose }) => {
	const { blocks, templates, setBlocks, setTemplates } = useRoutineStore();
	const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(() =>
		getPomodoroSettings()
	);
	
	const { 
		backgroundColor, 
		clockFaceColor, 
		clockScale,
		setBackgroundColor, 
		setClockFaceColor, 
		setClockScale,
		resetAppearance 
	} = useAppearanceStore();

	const handlePomodoroSettingChange = (key: keyof PomodoroSettings, value: number) => {
		const newSettings = { ...pomodoroSettings, [key]: value };
		setPomodoroSettings(newSettings);
		savePomodoroSettings(newSettings);
	};

	const handleExport = () => {
		const data = {
			version: "1.0.0",
			blocks,
			templates,
			exportedAt: new Date().toISOString(),
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `oqlock-backup-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const data = JSON.parse(event.target?.result as string);
				if (data.blocks) setBlocks(data.blocks);
				if (data.templates) setTemplates(data.templates);
				alert("Data imported successfully!");
			} catch (err) {
				alert("Failed to import: Invalid JSON file");
			}
		};
		reader.readAsText(file);
	};

	return (
		<>
			{isOpen && <div className="settings-overlay" onClick={onClose} />}

			<div className={`settings-sidebar glass-panel ${isOpen ? "open" : ""}`}>
				<div className="settings-header">
					<h2>Settings</h2>
					<button className="icon-btn-sm" onClick={onClose} aria-label="Close">
						<X size={20} />
					</button>
				</div>

				<div className="settings-content">
					<div className="settings-section">
						<div className="section-title-group">
							<Palette size={16} />
							<h3>Appearance</h3>
						</div>
						
						<div className="setting-item">
							<div className="setting-item-header">
								<label>Theme</label>
								<ThemeToggle />
							</div>
						</div>

						<div className="setting-item">
							<label>Background Color</label>
							<div className="color-presets-grid">
								{BG_PRESETS.map(c => (
									<button 
										key={c}
										className={`preset-swatch ${backgroundColor === c ? 'active' : ''}`}
										style={{ backgroundColor: c === 'transparent' ? 'rgba(0,0,0,0.05)' : c }}
										onClick={() => setBackgroundColor(c)}
										title={c}
									/>
								))}
							</div>
							<div className="color-picker-group">
								<Pipette size={14} className="picker-icon" />
								<input 
									type="color" 
									value={backgroundColor.startsWith('#') ? backgroundColor : '#ffffff'} 
									onChange={(e) => setBackgroundColor(e.target.value)}
									className="premium-color-input"
								/>
								<span className="color-hex-label">{backgroundColor}</span>
							</div>
						</div>

						<div className="setting-item">
							<label>Clock Face Color</label>
							<div className="color-presets-grid">
								{CLOCK_PRESETS.map(c => (
									<button 
										key={c}
										className={`preset-swatch ${clockFaceColor === c ? 'active' : ''}`}
										style={{ backgroundColor: c === 'transparent' ? 'rgba(0,0,0,0.05)' : c }}
										onClick={() => setClockFaceColor(c)}
										title={c}
									/>
								))}
							</div>
							<div className="color-picker-group">
								<Pipette size={14} className="picker-icon" />
								<input 
									type="color" 
									value={clockFaceColor.startsWith('#') ? clockFaceColor : '#ffffff'} 
									onChange={(e) => setClockFaceColor(e.target.value)}
									className="premium-color-input"
								/>
								<span className="color-hex-label">{clockFaceColor}</span>
							</div>
						</div>
						
						<div className="setting-item">
							<label>Clock Size ({Math.round(clockScale * 100)}%)</label>
							<div className="range-group">
								<input 
									type="range" 
									min="0.5" 
									max="1.5" 
									step="0.05"
									value={clockScale} 
									onChange={(e) => setClockScale(parseFloat(e.target.value))}
									className="premium-range-input"
								/>
							</div>
						</div>
						
						<button className="btn-ghost-sm" onClick={resetAppearance}>
							<RotateCcw size={14} /> Reset Appearance
						</button>
					</div>

					<div className="settings-section">
						<div className="section-title-group">
							<Timer size={16} />
							<h3>Pomodoro Timer</h3>
						</div>
						<div className="setting-item">
							<label>Work Duration ({pomodoroSettings.workDuration}m)</label>
							<div className="range-group">
								<input
									type="range"
									min="1" max="90"
									value={pomodoroSettings.workDuration}
									onChange={(e) => handlePomodoroSettingChange("workDuration", Number(e.target.value))}
									className="premium-range-input"
								/>
							</div>
						</div>
						<div className="setting-item">
							<label>Short Break ({pomodoroSettings.shortBreak}m)</label>
							<div className="range-group">
								<input
									type="range"
									min="1" max="30"
									value={pomodoroSettings.shortBreak}
									onChange={(e) => handlePomodoroSettingChange("shortBreak", Number(e.target.value))}
									className="premium-range-input"
								/>
							</div>
						</div>
						<div className="setting-item">
							<label>Long Break ({pomodoroSettings.longBreak}m)</label>
							<div className="range-group">
								<input
									type="range"
									min="1" max="60"
									value={pomodoroSettings.longBreak}
									onChange={(e) => handlePomodoroSettingChange("longBreak", Number(e.target.value))}
									className="premium-range-input"
								/>
							</div>
						</div>
					</div>

					<div className="settings-section">
						<h3>Data Management</h3>
						<div className="data-actions">
							<button className="btn-outline" onClick={handleExport}>
								<Download size={16} /> Export JSON
							</button>
							<label className="btn-outline cursor-pointer">
								<Upload size={16} /> Import JSON
								<input type="file" hidden accept=".json" onChange={handleImport} />
							</label>
						</div>
						
						<button
							className="btn-danger-outline"
							onClick={() => {
								if (confirm("Delete everything? This cannot be undone.")) {
									localStorage.clear();
									window.location.reload();
								}
							}}
						>
							<Trash2 size={16} /> Reset All Data
						</button>
					</div>

					<div className="settings-footer">
						<p>Oqloq v1.1.0</p>
						<div className="footer-links">
							<a href="https://github.com/cnklc/oqloq" target="_blank" rel="noreferrer">
								<Code size={16} /> Source
							</a>
							<a href="https://oqloq.life" target="_blank" rel="noreferrer">
								<ExternalLink size={16} /> Website
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
