import { describe, it, expect } from "vitest";
import {
	minutesToDegrees,
	degreesToMinutes,
	minutesToTimeString,
	timeStringToMinutes,
	clampMinutes,
	isTimeInBlock,
} from "./clockService";

describe("minutesToDegrees / degreesToMinutes", () => {
	it("maps 0 minutes to 0 degrees", () => {
		expect(minutesToDegrees(0)).toBe(0);
	});

	it("maps 720 minutes (12:00) to 180 degrees", () => {
		expect(minutesToDegrees(720)).toBe(180);
	});

	it("round-trips degrees back to minutes", () => {
		expect(degreesToMinutes(minutesToDegrees(615))).toBeCloseTo(615);
	});
});

describe("minutesToTimeString / timeStringToMinutes", () => {
	it("formats minutes as zero-padded HH:MM", () => {
		expect(minutesToTimeString(0)).toBe("00:00");
		expect(minutesToTimeString(545)).toBe("09:05");
		expect(minutesToTimeString(1439)).toBe("23:59");
	});

	it("parses HH:MM back to minutes", () => {
		expect(timeStringToMinutes("00:00")).toBe(0);
		expect(timeStringToMinutes("09:05")).toBe(545);
		expect(timeStringToMinutes("23:59")).toBe(1439);
	});
});

describe("clampMinutes", () => {
	it("clamps below 0 and above 1439", () => {
		expect(clampMinutes(-30)).toBe(0);
		expect(clampMinutes(5000)).toBe(1439);
	});

	it("rounds fractional minutes", () => {
		expect(clampMinutes(120.6)).toBe(121);
	});
});

describe("isTimeInBlock", () => {
	it("detects minutes inside a normal block", () => {
		// 09:00 - 17:00
		expect(isTimeInBlock(600, 540, 1020)).toBe(true);
	});

	it("excludes the end minute and minutes outside a normal block", () => {
		expect(isTimeInBlock(1020, 540, 1020)).toBe(false);
		expect(isTimeInBlock(300, 540, 1020)).toBe(false);
	});

	it("detects minutes inside a block that crosses midnight", () => {
		// 22:00 - 06:00 (start > end)
		expect(isTimeInBlock(1380, 1320, 360)).toBe(true); // 23:00
		expect(isTimeInBlock(120, 1320, 360)).toBe(true); // 02:00
	});

	it("excludes minutes outside a midnight-crossing block", () => {
		// 22:00 - 06:00
		expect(isTimeInBlock(720, 1320, 360)).toBe(false); // 12:00
		expect(isTimeInBlock(360, 1320, 360)).toBe(false); // exactly the end
	});
});
