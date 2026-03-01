/**
 * Clock Component - Bauhaus Edition
 * 24-hour circular clock with segment dividers and center time display
 */

import React, { useRef, useState } from "react";
import type { RoutineBlock } from "../../types/models";
import { minutesToDegrees } from "../../services/clockService";
import "./Clock.css";

interface ClockProps {
	blocks: RoutineBlock[];
	currentMinute: number;
	currentTimeFormatted: string;
	onBlockClick: (blockId: string) => void;
	onEmptyClick: (minute: number) => void;
	onDropColor?: (blockId: string, color: string) => void;
	selectedBlockId?: string;
}

const CLOCK_SIZE = 560;
const CENTER_X = CLOCK_SIZE / 2;
const CENTER_Y = CLOCK_SIZE / 2;
const MAIN_CIRCLE_RADIUS = 240;
const OUTER_RING_OUTER = MAIN_CIRCLE_RADIUS + 28;
const OUTER_RING_INNER = MAIN_CIRCLE_RADIUS + 8;

export const Clock: React.FC<ClockProps> = ({
	blocks,
	currentMinute,
	currentTimeFormatted,
	onBlockClick,
	onEmptyClick,
	onDropColor,
	selectedBlockId,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

	// Find active block for time hand color
	const activeBlock = blocks.find(
		(block) => currentMinute >= block.startMinute && currentMinute < block.endMinute
	);
	const timeHandColor = activeBlock?.color || "#E63946";

	const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;

		const svg = svgRef.current;
		const rect = svg.getBoundingClientRect();
		// Convert screen coordinates to SVG coordinate space when the SVG is scaled
		const x = (event.clientX - rect.left) * (CLOCK_SIZE / rect.width);
		const y = (event.clientY - rect.top) * (CLOCK_SIZE / rect.height);

		const relX = x - CENTER_X;
		const relY = y - CENTER_Y;
		const distance = Math.sqrt(relX * relX + relY * relY);

		// Check if click is within the outer indicator ring
		if (distance >= OUTER_RING_INNER && distance <= OUTER_RING_OUTER) {
			let angle = Math.atan2(relY, relX) * (180 / Math.PI);
			angle = (angle + 90 + 360) % 360;
			const minute = Math.round((angle / 360) * 1440) % 1440;

			const clickedBlock = blocks.find(
				(block) => minute >= block.startMinute && minute < block.endMinute
			);

			if (clickedBlock) {
				onBlockClick(clickedBlock.id);
			} else {
				onEmptyClick(minute);
			}
		}
	};

	// Generate 24-hour segment divider lines
	const segmentLines = Array.from({ length: 24 }, (_, i) => {
		const angle = (i / 24) * 360 - 90;
		const rad = (angle * Math.PI) / 180;
		const isHour = true; // All 24 are hour marks
		const innerR = MAIN_CIRCLE_RADIUS - (isHour ? 28 : 12);
		const outerR = MAIN_CIRCLE_RADIUS;

		return {
			x1: CENTER_X + Math.cos(rad) * innerR,
			y1: CENTER_Y + Math.sin(rad) * innerR,
			x2: CENTER_X + Math.cos(rad) * outerR,
			y2: CENTER_Y + Math.sin(rad) * outerR,
			label: `${i}`.padStart(2, "0"),
			labelX: CENTER_X + Math.cos(rad) * (MAIN_CIRCLE_RADIUS - 44),
			labelY: CENTER_Y + Math.sin(rad) * (MAIN_CIRCLE_RADIUS - 44),
			angle,
		};
	});

	// Current time hand angle
	const currentAngle = minutesToDegrees(currentMinute) - 90;
	const currentRad = (currentAngle * Math.PI) / 180;
	const handInnerR = MAIN_CIRCLE_RADIUS - 20;
	const handOuterR = MAIN_CIRCLE_RADIUS + 4;

	return (
		<div className="clock-container">
			<svg
				ref={svgRef}
				width={CLOCK_SIZE}
				height={CLOCK_SIZE}
				viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
				className="clock-svg"
				onClick={handleSvgClick}
			>
				{/* Background circle */}
				<circle
					cx={CENTER_X}
					cy={CENTER_Y}
					r={MAIN_CIRCLE_RADIUS}
					className="clock-main-circle"
					strokeWidth="2"
				/>

				{/* Block arcs in the outer ring */}
				{blocks.map((block) => {
					const startAngle = (block.startMinute / 1440) * 360 - 90;
					const endAngle = (block.endMinute / 1440) * 360 - 90;
					const startRad = (startAngle * Math.PI) / 180;
					const endRad = (endAngle * Math.PI) / 180;

					const outerStartX = CENTER_X + Math.cos(startRad) * OUTER_RING_OUTER;
					const outerStartY = CENTER_Y + Math.sin(startRad) * OUTER_RING_OUTER;
					const outerEndX = CENTER_X + Math.cos(endRad) * OUTER_RING_OUTER;
					const outerEndY = CENTER_Y + Math.sin(endRad) * OUTER_RING_OUTER;

					const innerStartX = CENTER_X + Math.cos(startRad) * OUTER_RING_INNER;
					const innerStartY = CENTER_Y + Math.sin(startRad) * OUTER_RING_INNER;
					const innerEndX = CENTER_X + Math.cos(endRad) * OUTER_RING_INNER;
					const innerEndY = CENTER_Y + Math.sin(endRad) * OUTER_RING_INNER;

					const largeArc = block.endMinute - block.startMinute > 720 ? 1 : 0;

					const pathData = `
						M ${outerStartX} ${outerStartY}
						A ${OUTER_RING_OUTER} ${OUTER_RING_OUTER} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
						L ${innerEndX} ${innerEndY}
						A ${OUTER_RING_INNER} ${OUTER_RING_INNER} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
						Z
					`;

					const isSelected = selectedBlockId === block.id;
					const isDragOver = dragOverBlockId === block.id;

					return (
						<path
							key={block.id}
							d={pathData}
							fill={block.color}
							opacity={isDragOver ? 1 : isSelected ? 1 : 0.9}
							stroke={isSelected || isDragOver ? "#1A1A1A" : "none"}
							strokeWidth={isSelected || isDragOver ? "2" : "0"}
							style={{ cursor: "pointer" }}
							onClick={(e) => {
								e.stopPropagation();
								onBlockClick(block.id);
							}}
							onDragOver={(e) => {
								e.preventDefault();
								e.dataTransfer.dropEffect = "copy";
								setDragOverBlockId(block.id);
							}}
							onDragLeave={() => setDragOverBlockId(null)}
							onDrop={(e) => {
								e.preventDefault();
								e.stopPropagation();
								const color = e.dataTransfer.getData("text/plain");
								if (color && onDropColor) {
									onDropColor(block.id, color);
								}
								setDragOverBlockId(null);
							}}
						/>
					);
				})}

				{/* 24-segment divider lines */}
				{segmentLines.map((line, i) => (
					<line
						key={i}
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						stroke="#1A1A1A"
						strokeWidth="1"
						opacity="0.25"
					/>
				))}

				{/* Hour labels */}
				{segmentLines
					.filter((_, i) => i % 3 === 0)
					.map((line, i) => {
						const idx = segmentLines.indexOf(line);
						return (
							<text
								key={`label-${i}`}
								x={line.labelX}
								y={line.labelY}
								textAnchor="middle"
								dominantBaseline="middle"
								fontSize="9"
								fontFamily="'JetBrains Mono', 'Courier New', monospace"
								fontWeight="700"
								fill="#1A1A1A"
								opacity="0.4"
							>
								{idx}
							</text>
						);
					})}

				{/* Current time indicator line */}
				<line
					x1={CENTER_X + Math.cos(currentRad) * handInnerR}
					y1={CENTER_Y + Math.sin(currentRad) * handInnerR}
					x2={CENTER_X + Math.cos(currentRad) * handOuterR}
					y2={CENTER_Y + Math.sin(currentRad) * handOuterR}
					stroke={timeHandColor}
					strokeWidth="4"
					className="second-hand"
				/>

				{/* Center dot */}
				<circle cx={CENTER_X} cy={CENTER_Y} r="4" fill="#1A1A1A" />

				{/* Center digital clock */}
				<text
					x={CENTER_X}
					y={CENTER_Y - 8}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize="44"
					fontFamily="'JetBrains Mono', 'Courier New', monospace"
					fontWeight="700"
					fill="#1A1A1A"
					letterSpacing="2"
				>
					{currentTimeFormatted}
				</text>

				{/* Active block label below time */}
				{activeBlock && (
					<text
						x={CENTER_X}
						y={CENTER_Y + 34}
						textAnchor="middle"
						dominantBaseline="middle"
						fontSize="11"
						fontFamily="'Montserrat', 'Futura', sans-serif"
						fontWeight="700"
						fill={activeBlock.color}
						letterSpacing="2"
					>
						{activeBlock.title.toUpperCase()}
					</text>
				)}
			</svg>
		</div>
	);
};
