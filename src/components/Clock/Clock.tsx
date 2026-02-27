/**
 * Clock Component
 * Main 24-hour circular clock visualization
 */

import React, { useRef } from "react";
import type { RoutineBlock } from "../../types/models";
import { minutesToDegrees } from "../../services/clockService";
import "./Clock.css";

interface ClockProps {
	blocks: RoutineBlock[];
	currentMinute: number;
	onBlockClick: (blockId: string) => void;
	onEmptyClick: (minute: number) => void;
	selectedBlockId?: string;
}

const CLOCK_SIZE = 600;
const CENTER_X = CLOCK_SIZE / 2;
const CENTER_Y = CLOCK_SIZE / 2;
const MAIN_CIRCLE_RADIUS = 250; // 500px çap için
const SECOND_HAND_START = MAIN_CIRCLE_RADIUS - 20; // En dış alanından 20px içerde
const SECOND_HAND_LENGTH = 100; // 100px uzunluğunda
const SECOND_HAND_END = SECOND_HAND_START - SECOND_HAND_LENGTH;
const OUTER_INDICATOR_GAP = 25; // Saatin gövdesi ile halka arasındaki boşluk (halka genişliğine eşit)
const OUTER_INDICATOR_WIDTH = 15; // Halka genişliğinin %60'ı (25 * 0.6 = 15)
const OUTER_INDICATOR_RADIUS = MAIN_CIRCLE_RADIUS + OUTER_INDICATOR_GAP + OUTER_INDICATOR_WIDTH; // Dış halkanın dış kenarı

export const Clock: React.FC<ClockProps> = ({
	blocks,
	currentMinute,
	onBlockClick,
	onEmptyClick,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);

	// Find active block for time hand color
	const activeBlock = blocks.find(
		(block) => currentMinute >= block.startMinute && currentMinute < block.endMinute
	);
	const timeHandColor = activeBlock?.color || "#FF6B6B";

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

		// Check if click is within the outer indicator ring
		const innerRadius = OUTER_INDICATOR_RADIUS - OUTER_INDICATOR_WIDTH;
		if (distance >= innerRadius && distance <= OUTER_INDICATOR_RADIUS) {
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
				{/* Arka plan - beyaz daire */}
				<circle
					cx={CENTER_X}
					cy={CENTER_Y}
					r={MAIN_CIRCLE_RADIUS}
					fill="#ffffff"
					stroke="#e0e0e0"
					strokeWidth="1"
				/>

				{/* Dış halka - zaman dilimi göstergesi (silindir efekti ile) */}
				{blocks.map((block) => {
					const startAngle = (block.startMinute / 1440) * 360 - 90;
					const endAngle = (block.endMinute / 1440) * 360 - 90;
					const startRad = (startAngle * Math.PI) / 180;
					const endRad = (endAngle * Math.PI) / 180;

					// Dış halkanın başlangıç noktası
					const outerStartX = CENTER_X + Math.cos(startRad) * OUTER_INDICATOR_RADIUS;
					const outerStartY = CENTER_Y + Math.sin(startRad) * OUTER_INDICATOR_RADIUS;
					const outerEndX = CENTER_X + Math.cos(endRad) * OUTER_INDICATOR_RADIUS;
					const outerEndY = CENTER_Y + Math.sin(endRad) * OUTER_INDICATOR_RADIUS;

					// İç kenarı (halkanın iç tarafı)
					const innerRadius = OUTER_INDICATOR_RADIUS - OUTER_INDICATOR_WIDTH;
					const innerStartX = CENTER_X + Math.cos(startRad) * innerRadius;
					const innerStartY = CENTER_Y + Math.sin(startRad) * innerRadius;
					const innerEndX = CENTER_X + Math.cos(endRad) * innerRadius;
					const innerEndY = CENTER_Y + Math.sin(endRad) * innerRadius;

					const largeArc = block.endMinute - block.startMinute > 720 ? 1 : 0;

					const pathData = `
								M ${outerStartX} ${outerStartY}
								A ${OUTER_INDICATOR_RADIUS} ${OUTER_INDICATOR_RADIUS} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
								L ${innerEndX} ${innerEndY}
								A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
								Z
							`;

					return (
						<g key={`indicator-${block.id}`}>
							{/* Alt taraf - koyu gölge */}
							<path d={pathData} fill={block.color} opacity="0.5" className="outer-ring-shadow" />
							{/* Üst taraf - açık */}
							<path
								d={pathData}
								fill={block.color}
								opacity="0.85"
								className="outer-ring-light"
								onClick={(e) => {
									e.stopPropagation();
									onBlockClick(block.id);
								}}
								style={{ cursor: "pointer" }}
							/>
						</g>
					);
				})}

				{/* Yelkovan (saniye ibresi) - merkeze bağlantısı görünmeyecek */}
				<line
					x1={
						CENTER_X +
						Math.cos((minutesToDegrees(currentMinute) - 90) * (Math.PI / 180)) * SECOND_HAND_START
					}
					y1={
						CENTER_Y +
						Math.sin((minutesToDegrees(currentMinute) - 90) * (Math.PI / 180)) * SECOND_HAND_START
					}
					x2={
						CENTER_X +
						Math.cos((minutesToDegrees(currentMinute) - 90) * (Math.PI / 180)) * SECOND_HAND_END
					}
					y2={
						CENTER_Y +
						Math.sin((minutesToDegrees(currentMinute) - 90) * (Math.PI / 180)) * SECOND_HAND_END
					}
					stroke={timeHandColor}
					strokeWidth="4"
					strokeLinecap="round"
					className="second-hand"
					style={{
						transition: "none",
					}}
				/>
			</svg>
		</div>
	);
};
