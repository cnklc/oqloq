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
import {
	X,
	Download,
	Upload,
	Trash2,
	Code,
	Palette,
	RotateCcw,
	Timer,
	Pipette,
	Database,
} from "lucide-react";
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
	"transparent", // Ghost mode
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
		resetAppearance,
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
		a.download = `oqlock-backup-${new Date().toISOString().split("T")[0]}.json`;
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
				alert("Veriler başarıyla içe aktarıldı!");
			} catch {
				alert("İçe aktarma başarısız: Geçersiz JSON dosyası");
			}
		};
		reader.readAsText(file);
	};

	return (
		<>
			{isOpen && <div className="settings-overlay" onClick={onClose} />}

			<div className={`settings-sidebar glass-panel ${isOpen ? "open" : ""}`}>
				<div className="settings-header">
					<h2>Ayarlar</h2>
					<button className="icon-btn-sm" onClick={onClose} aria-label="Kapat">
						<X size={20} />
					</button>
				</div>

				<div className="settings-content">
					<div className="settings-section">
						<div className="section-title-group">
							<Palette size={16} />
							<h3>Görünüm</h3>
						</div>

						<div className="setting-item">
							<div className="setting-item-header">
								<label>Tema</label>
								<ThemeToggle />
							</div>
						</div>

						<div className="setting-item">
							<label>Arka Plan Rengi</label>
							<div className="color-presets-grid">
								{BG_PRESETS.map((c) => (
									<button
										key={c}
										className={`preset-swatch ${backgroundColor === c ? "active" : ""}`}
										style={{ backgroundColor: c === "transparent" ? "rgba(0,0,0,0.05)" : c }}
										onClick={() => setBackgroundColor(c)}
										title={c}
									/>
								))}
							</div>
							<div className="color-picker-group">
								<Pipette size={14} className="picker-icon" />
								<input
									type="color"
									value={backgroundColor.startsWith("#") ? backgroundColor : "#ffffff"}
									onChange={(e) => setBackgroundColor(e.target.value)}
									className="premium-color-input"
								/>
								<span className="color-hex-label">{backgroundColor}</span>
							</div>
						</div>

						<div className="setting-item">
							<label>Saat Kadranı Rengi</label>
							<div className="color-presets-grid">
								{CLOCK_PRESETS.map((c) => (
									<button
										key={c}
										className={`preset-swatch ${clockFaceColor === c ? "active" : ""}`}
										style={{ backgroundColor: c === "transparent" ? "rgba(0,0,0,0.05)" : c }}
										onClick={() => setClockFaceColor(c)}
										title={c}
									/>
								))}
							</div>
							<div className="color-picker-group">
								<Pipette size={14} className="picker-icon" />
								<input
									type="color"
									value={clockFaceColor.startsWith("#") ? clockFaceColor : "#ffffff"}
									onChange={(e) => setClockFaceColor(e.target.value)}
									className="premium-color-input"
								/>
								<span className="color-hex-label">{clockFaceColor}</span>
							</div>
						</div>

						<div className="setting-item">
							<label>Saat Boyutu ({Math.round(clockScale * 100)}%)</label>
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
							<RotateCcw size={14} /> Görünümü Sıfırla
						</button>
					</div>

					<div className="settings-section">
						<div className="section-title-group">
							<Timer size={16} />
							<h3>Pomodoro Zamanlayıcı</h3>
						</div>
						<div className="setting-item">
							<label>Çalışma Süresi ({pomodoroSettings.workDuration} dk)</label>
							<div className="range-group">
								<input
									type="range"
									min="1"
									max="90"
									value={pomodoroSettings.workDuration}
									onChange={(e) =>
										handlePomodoroSettingChange("workDuration", Number(e.target.value))
									}
									className="premium-range-input"
								/>
							</div>
						</div>
						<div className="setting-item">
							<label>Kısa Mola ({pomodoroSettings.shortBreak} dk)</label>
							<div className="range-group">
								<input
									type="range"
									min="1"
									max="30"
									value={pomodoroSettings.shortBreak}
									onChange={(e) =>
										handlePomodoroSettingChange("shortBreak", Number(e.target.value))
									}
									className="premium-range-input"
								/>
							</div>
						</div>
						<div className="setting-item">
							<label>Uzun Mola ({pomodoroSettings.longBreak} dk)</label>
							<div className="range-group">
								<input
									type="range"
									min="1"
									max="60"
									value={pomodoroSettings.longBreak}
									onChange={(e) => handlePomodoroSettingChange("longBreak", Number(e.target.value))}
									className="premium-range-input"
								/>
							</div>
						</div>
					</div>

					<div className="settings-section">
						<div className="section-title-group">
							<Database size={16} />
							<h3>Veri Yönetimi</h3>
						</div>
						<div className="data-actions">
							<button className="btn-outline" onClick={handleExport}>
								<Download size={16} /> JSON Dışa Aktar
							</button>
							<label className="btn-outline cursor-pointer">
								<Upload size={16} /> JSON İçe Aktar
								<input type="file" hidden accept=".json" onChange={handleImport} />
							</label>
						</div>

						<button
							className="btn-danger-outline"
							onClick={() => {
								if (confirm("Her şey silinsin mi? Bu işlem geri alınamaz.")) {
									localStorage.clear();
									window.location.reload();
								}
							}}
						>
							<Trash2 size={16} /> Tüm Verileri Sıfırla
						</button>
					</div>

					<div className="settings-footer">
						<p>Oqloq v1.1.0</p>
						<div className="footer-links">
							<a href="https://github.com/cnklc/oqloq" target="_blank" rel="noreferrer">
								<Code size={16} /> Kaynak
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
