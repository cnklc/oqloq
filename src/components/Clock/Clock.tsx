/**
 * Clock Component
 * Main 24-hour circular clock visualization
 */

import React, { useState, useRef } from "react";
import type { RoutineBlock } from "../../types/models";
import { minutesToDegrees, getBlockArcPath } from "../../services/clockService";
import "./Clock.css";

interface ClockProps {
	blocks: RoutineBlock[];
	currentMinute: number;
	onBlockClick: (blockId: string) => void;
	onEmptyClick: (minute: number) => void;
	selectedBlockId?: string;
}

const CLOCK_SIZE = 500;
const CENTER_X = CLOCK_SIZE / 2;
const CENTER_Y = CLOCK_SIZE / 2;
const OUTER_RADIUS = 200;
const BLOCK_THICKNESS = 40;
const HOUR_MARK_LENGTH = 20;

export const Clock: React.FC<ClockProps> = ({
	blocks,
	currentMinute,
	onBlockClick,
	onEmptyClick,
	selectedBlockId,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

	const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;

		const svg = svgRef.current;
		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Translate to center coordinates
		const relX = x - CENTER_X;
		const relY = y - CENTER_Y;

		// Calculate distance from center
		const distance = Math.sqrt(relX * relX + relY * relY);

		// Check if click is within block ring
		const innerRadius = OUTER_RADIUS - BLOCK_THICKNESS;
		if (distance >= innerRadius && distance <= OUTER_RADIUS) {
			// Calculate angle
			let angle = Math.atan2(relY, relX) * (180 / Math.PI);
			angle = (angle + 90 + 360) % 360; // Adjust for clock starting at top

			const minute = Math.round((angle / 360) * 1440) % 1440;

			// Check if clicking on existing block
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
					r={OUTER_RADIUS + 20}
					fill="#ffffff"
					stroke="#f0f0f0"
					strokeWidth="2"
				/>

				{/* Hour markers */}
				{Array.from({ length: 24 }).map((_, i) => {
					const angle = (i / 24) * 360 - 90;
					const angleRad = (angle * Math.PI) / 180;
					const outerX = CENTER_X + Math.cos(angleRad) * (OUTER_RADIUS + 10);
					const outerY = CENTER_Y + Math.sin(angleRad) * (OUTER_RADIUS + 10);
					const innerX = CENTER_X + Math.cos(angleRad) * (OUTER_RADIUS + 10 - HOUR_MARK_LENGTH);
					const innerY = CENTER_Y + Math.sin(angleRad) * (OUTER_RADIUS + 10 - HOUR_MARK_LENGTH);

					return (
						<g key={`hour-${i}`}>
							{/* Hour mark line */}
							<line
								x1={innerX}
								y1={innerY}
								x2={outerX}
								y2={outerY}
								stroke="#d0d0d0"
								strokeWidth="2"
							/>
							{/* Hour label */}
							<text
								x={CENTER_X + Math.cos(angleRad) * (OUTER_RADIUS + 35)}
								y={CENTER_Y + Math.sin(angleRad) * (OUTER_RADIUS + 35)}
								textAnchor="middle"
								dominantBaseline="middle"
								className="hour-label"
								fontSize="12"
								fill="#999"
							>
								{i}
							</text>
						</g>
					);
				})}

				{/* Render block segments */}
				{blocks.map((block) => {
					const isSelected = block.id === selectedBlockId;
					const isHovered = block.id === hoveredBlockId;
					const pathData = getBlockArcPath(
						block.startMinute,
						block.endMinute,
						OUTER_RADIUS,
						BLOCK_THICKNESS,
						CENTER_X,
						CENTER_Y
					);

					return (
						<g
							key={block.id}
							onMouseEnter={() => setHoveredBlockId(block.id)}
							onMouseLeave={() => setHoveredBlockId(null)}
							className={`block-segment ${isSelected ? "selected" : ""} ${
								isHovered ? "hovered" : ""
							}`}
							style={{ cursor: "pointer" }}
						>
							<path
								d={pathData}
								fill={block.color}
								stroke="rgba(0,0,0,0.1)"
								strokeWidth="1"
								opacity={isHovered ? 0.9 : 0.8}
								style={{
									filter: isSelected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
									transition: "all 0.2s ease",
								}}
							/>
							{/* Block label */}
							{block.endMinute - block.startMinute >= 60 && (
								<text
									x={CENTER_X}
									y={CENTER_Y}
									textAnchor="middle"
									dominantBaseline="middle"
									className="block-label"
									fontSize="12"
									fill="#333"
									pointerEvents="none"
									opacity={isHovered || isSelected ? 1 : 0.6}
									style={{ transition: "opacity 0.2s ease" }}
								>
									{block.title}
								</text>
							)}
						</g>
					);
				})}

				{/* Current time hand */}
				<line
					x1={CENTER_X}
					y1={CENTER_Y}
					x2={
						CENTER_X +
						Math.cos((minutesToDegrees(currentMinute) - 90) * (Math.PI / 180)) *
							(OUTER_RADIUS - BLOCK_THICKNESS - 20)
					}
					y2={
						CENTER_Y +
						Math.sin((minutesToDegrees(currentMinute) - 90) * (Math.PI / 180)) *
							(OUTER_RADIUS - BLOCK_THICKNESS - 20)
					}
					stroke="#FF6B6B"
					strokeWidth="3"
					strokeLinecap="round"
					className="time-hand"
					style={{
						transition: "none",
					}}
				/>

				{/* Center dot */}
				<circle cx={CENTER_X} cy={CENTER_Y} r="6" fill="#FF6B6B" />
			</svg>
		</div>
	);
};
