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

// Bauhaus color palette
export const COLOR_PALETTE = [
	"#E63946", // Cadmium Red
	"#1D3557", // Prussian Blue
	"#FFB703", // Golden Yellow
	"#1A1A1A", // Black
	"#F2F2F2", // Off-white
	"#457B9D", // Steel Blue
	"#A8DADC", // Light Cyan
	"#E9C46A", // Sand Yellow
];

// Day schedule: maps a day of week to a set of routine blocks
export interface DaySchedule {
	dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
	blocks: RoutineBlock[];
}

// Default templates
export const DEFAULT_TEMPLATES: Template[] = [
	{
		id: "student",
		name: "Student",
		blocks: [
			{
				id: "student-sleep-1",
				title: "Sleep",
				color: "#1D3557",
				startMinute: 0, // 00:00
				endMinute: 480, // 08:00
				todos: [],
			},
			{
				id: "student-school",
				title: "School",
				color: "#FFB703",
				startMinute: 480, // 08:00
				endMinute: 960, // 16:00
				todos: [],
			},
			{
				id: "student-study",
				title: "Study",
				color: "#E63946",
				startMinute: 960, // 16:00
				endMinute: 1200, // 20:00
				todos: [],
			},
			{
				id: "student-free",
				title: "Free Time",
				color: "#457B9D",
				startMinute: 1200, // 20:00
				endMinute: 1440, // 24:00
				todos: [],
			},
		],
	},
	{
		id: "professional",
		name: "Professional",
		blocks: [
			{
				id: "pro-sleep",
				title: "Sleep",
				color: "#1D3557",
				startMinute: 0, // 00:00
				endMinute: 420, // 07:00
				todos: [],
			},
			{
				id: "pro-deepwork",
				title: "Deep Work",
				color: "#E63946",
				startMinute: 420, // 07:00
				endMinute: 840, // 14:00
				todos: [],
			},
			{
				id: "pro-meetings",
				title: "Meetings",
				color: "#FFB703",
				startMinute: 840, // 14:00
				endMinute: 1080, // 18:00
				todos: [],
			},
			{
				id: "pro-personal",
				title: "Personal Time",
				color: "#457B9D",
				startMinute: 1080, // 18:00
				endMinute: 1440, // 24:00
				todos: [],
			},
		],
	},
];
