/**
 * DailySchedule Component
 * Manage day-of-week specific programs:
 * - Save current blocks as a day's schedule
 * - Copy a day's schedule to multiple days
 * - Delete a day's schedule
 * The Dashboard auto-loads today's schedule on mount.
 */

import React, { useState } from "react";
import type { DaySchedule, RoutineBlock } from "../../types/models";
import { getDaySchedules, saveDaySchedule, deleteDaySchedule } from "../../services/storageService";
import "./DailySchedule.css";

const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAY_NAMES_SHORT = ["Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cmt"];

const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri
const WEEKEND = [0, 6]; // Sun-Sat
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun display order

const deepCloneBlocks = (blocks: RoutineBlock[]): RoutineBlock[] =>
	blocks.map((b) => ({ ...b, todos: b.todos.map((t) => ({ ...t })) }));

interface DailyScheduleProps {
	currentBlocks: RoutineBlock[];
	onLoadSchedule: (blocks: RoutineBlock[]) => void;
	currentDayOfWeek: number;
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({
	currentBlocks,
	onLoadSchedule,
	currentDayOfWeek,
}) => {
	const [schedules, setSchedules] = useState<DaySchedule[]>(() => getDaySchedules());
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [saveToDays, setSaveToDays] = useState<number[]>([currentDayOfWeek]);
	const [copyFromDay, setCopyFromDay] = useState<number | null>(null);
	const [copyToDays, setCopyToDays] = useState<number[]>([]);

	const refreshSchedules = () => setSchedules(getDaySchedules());

	const getScheduleForDay = (day: number): DaySchedule | undefined =>
		schedules.find((s) => s.dayOfWeek === day);

	const toggleSaveDay = (day: number) => {
		setSaveToDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const toggleCopyDay = (day: number) => {
		setCopyToDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleSaveSchedule = () => {
		if (saveToDays.length === 0) {
			alert("Lütfen en az bir gün seçin.");
			return;
		}
		saveToDays.forEach((day) => {
			saveDaySchedule({
				dayOfWeek: day,
				blocks: deepCloneBlocks(currentBlocks),
			});
		});
		refreshSchedules();
		setShowSaveDialog(false);
		setSaveToDays([currentDayOfWeek]);
	};

	const handleCopySchedule = () => {
		if (copyFromDay === null) return;
		const source = getScheduleForDay(copyFromDay);
		if (!source) return;
		if (copyToDays.length === 0) {
			alert("Lütfen kopyalanacak günleri seçin.");
			return;
		}
		copyToDays.forEach((day) => {
			saveDaySchedule({
				dayOfWeek: day,
				blocks: deepCloneBlocks(source.blocks),
			});
		});
		refreshSchedules();
		setCopyFromDay(null);
		setCopyToDays([]);
	};

	const handleDeleteSchedule = (day: number) => {
		if (confirm(`${DAY_NAMES[day]} programını silmek istediğinizden emin misiniz?`)) {
			deleteDaySchedule(day);
			refreshSchedules();
		}
	};

	const handleLoadSchedule = (day: number) => {
		const schedule = getScheduleForDay(day);
		if (schedule) {
			onLoadSchedule(schedule.blocks);
		}
	};

	const handleSelectAllWeekdays = () => {
		setSaveToDays((prev) => {
			const hasAll = WEEKDAYS.every((d) => prev.includes(d));
			return hasAll
				? prev.filter((d) => !WEEKDAYS.includes(d))
				: [...new Set([...prev, ...WEEKDAYS])];
		});
	};

	const handleSelectWeekend = () => {
		setSaveToDays((prev) => {
			const hasAll = WEEKEND.every((d) => prev.includes(d));
			return hasAll
				? prev.filter((d) => !WEEKEND.includes(d))
				: [...new Set([...prev, ...WEEKEND])];
		});
	};

	const handleCopySelectAllWeekdays = () => {
		setCopyToDays((prev) => {
			const hasAll = WEEKDAYS.every((d) => prev.includes(d));
			return hasAll
				? prev.filter((d) => !WEEKDAYS.includes(d))
				: [...new Set([...prev, ...WEEKDAYS])];
		});
	};

	const handleCopySelectWeekend = () => {
		setCopyToDays((prev) => {
			const hasAll = WEEKEND.every((d) => prev.includes(d));
			return hasAll
				? prev.filter((d) => !WEEKEND.includes(d))
				: [...new Set([...prev, ...WEEKEND])];
		});
	};

	return (
		<div className="daily-schedule">
			<h3>Günlük Programlar</h3>

			<div className="day-grid">
				{DAY_ORDER.map((day) => {
					const schedule = getScheduleForDay(day);
					const isToday = day === currentDayOfWeek;
					return (
						<div key={day} className={`day-item ${isToday ? "today" : ""} ${schedule ? "has-schedule" : ""}`}>
							<span className="day-name">{DAY_NAMES_SHORT[day]}</span>
							{schedule && (
								<div className="day-actions">
									<button
										className="day-btn load"
										onClick={() => handleLoadSchedule(day)}
										title={`${DAY_NAMES[day]} programını yükle`}
									>
										▶
									</button>
									<button
										className="day-btn copy-from"
										onClick={() => {
											setCopyFromDay(day);
											setCopyToDays([]);
										}}
										title={`${DAY_NAMES[day]} programını kopyala`}
									>
										⧉
									</button>
									<button
										className="day-btn delete"
										onClick={() => handleDeleteSchedule(day)}
										title={`${DAY_NAMES[day]} programını sil`}
									>
										✕
									</button>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<button
				className="btn btn-secondary save-schedule-btn"
				onClick={() => {
					setSaveToDays([currentDayOfWeek]);
					setShowSaveDialog(true);
				}}
			>
				💾 Mevcut Programı Kaydet
			</button>

			{showSaveDialog && (
				<div className="schedule-dialog">
					<div className="schedule-dialog-content">
						<h4>Hangi günlere kayıt edilsin?</h4>
						<div className="day-checkboxes">
							{DAY_ORDER.map((day) => (
								<label key={day} className="day-checkbox-label">
									<input
										type="checkbox"
										checked={saveToDays.includes(day)}
										onChange={() => toggleSaveDay(day)}
									/>
									{DAY_NAMES[day]}
								</label>
							))}
						</div>
						<div className="quick-select">
							<button className="btn btn-ghost" onClick={handleSelectAllWeekdays}>
								Hafta İçi
							</button>
							<button className="btn btn-ghost" onClick={handleSelectWeekend}>
								Hafta Sonu
							</button>
						</div>
						<div className="dialog-actions">
							<button className="btn btn-primary" onClick={handleSaveSchedule}>
								Kaydet
							</button>
							<button
								className="btn btn-secondary"
								onClick={() => setShowSaveDialog(false)}
							>
								İptal
							</button>
						</div>
					</div>
				</div>
			)}

			{copyFromDay !== null && (
				<div className="schedule-dialog">
					<div className="schedule-dialog-content">
						<h4>{DAY_NAMES[copyFromDay]} programını kopyala:</h4>
						<div className="day-checkboxes">
							{DAY_ORDER
								.filter((d) => d !== copyFromDay)
								.map((day) => (
									<label key={day} className="day-checkbox-label">
										<input
											type="checkbox"
											checked={copyToDays.includes(day)}
											onChange={() => toggleCopyDay(day)}
										/>
										{DAY_NAMES[day]}
									</label>
								))}
						</div>
						<div className="quick-select">
							<button className="btn btn-ghost" onClick={handleCopySelectAllWeekdays}>
								Hafta İçi
							</button>
							<button className="btn btn-ghost" onClick={handleCopySelectWeekend}>
								Hafta Sonu
							</button>
						</div>
						<div className="dialog-actions">
							<button className="btn btn-primary" onClick={handleCopySchedule}>
								Kopyala
							</button>
							<button
								className="btn btn-secondary"
								onClick={() => {
									setCopyFromDay(null);
									setCopyToDays([]);
								}}
							>
								İptal
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
