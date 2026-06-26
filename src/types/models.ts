export interface Todo {
	id: string;
	text: string;
	completed: boolean;
}

export interface RoutineBlock {
	id: string;
	title: string;
	color: string;
	startMinute: number; // 0-1439 (24 hours in minutes)
	endMinute: number;
	todos: Todo[]; // Todo list for this block
}

export interface Template {
	id: string;
	name: string;
	blocks: RoutineBlock[];
}

// Default color palette
export const COLOR_PALETTE = [
	"#FFB4D6", // Pink
	"#A8D8FF", // Light blue
	"#FFD6A5", // Peachy
	"#CAFFBF", // Light green
	"#E0D5FF", // Lavender
	"#FFF4B0", // Pale yellow
	"#B4E3FF", // Cyan
	"#FFD1DC", // Light pink
];

// Default templates
export const DEFAULT_TEMPLATES: Template[] = [
	{
		id: "student",
		name: "Öğrenci",
		blocks: [
			{
				id: "student-sleep-1",
				title: "Uyku",
				color: "#A8D8FF",
				startMinute: 0, // 00:00
				endMinute: 480, // 08:00
				todos: [],
			},
			{
				id: "student-school",
				title: "Okul",
				color: "#FFD6A5",
				startMinute: 480, // 08:00
				endMinute: 960, // 16:00
				todos: [],
			},
			{
				id: "student-study",
				title: "Çalışma",
				color: "#CAFFBF",
				startMinute: 960, // 16:00
				endMinute: 1200, // 20:00
				todos: [],
			},
			{
				id: "student-free",
				title: "Boş Zaman",
				color: "#E0D5FF",
				startMinute: 1200, // 20:00
				endMinute: 1440, // 24:00
				todos: [],
			},
		],
	},
	{
		id: "professional",
		name: "Profesyonel",
		blocks: [
			{
				id: "pro-sleep",
				title: "Uyku",
				color: "#A8D8FF",
				startMinute: 0, // 00:00
				endMinute: 420, // 07:00
				todos: [],
			},
			{
				id: "pro-deepwork",
				title: "Derin Çalışma",
				color: "#FFD6A5",
				startMinute: 420, // 07:00
				endMinute: 840, // 14:00
				todos: [],
			},
			{
				id: "pro-meetings",
				title: "Toplantılar",
				color: "#CAFFBF",
				startMinute: 840, // 14:00
				endMinute: 1080, // 18:00
				todos: [],
			},
			{
				id: "pro-personal",
				title: "Kişisel Zaman",
				color: "#E0D5FF",
				startMinute: 1080, // 18:00
				endMinute: 1440, // 24:00
				todos: [],
			},
		],
	},
];
