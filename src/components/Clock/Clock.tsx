import React, { useRef, useMemo } from "react";
import type { RoutineBlock } from "../../types/models";
import { minutesToDegrees, getBlockArcPath } from "../../services/clockService";
import { motion } from "framer-motion";
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
const MAIN_CIRCLE_RADIUS = 220;
const TICK_OUTER = MAIN_CIRCLE_RADIUS - 5;
const TICK_INNER = TICK_OUTER - 15;
const BLOCK_RADIUS = MAIN_CIRCLE_RADIUS + 40;
const BLOCK_THICKNESS = 30;

export const Clock: React.FC<ClockProps> = ({
	blocks,
	currentMinute,
	onBlockClick,
	onEmptyClick,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);

	// Ticks and Labels
	const ticks = useMemo(() => {
		const items = [];
		for (let i = 0; i < 24; i++) {
			const angle = (i / 24) * 360 - 90;
			const rad = (angle * Math.PI) / 180;
			
			const x1 = CENTER_X + Math.cos(rad) * TICK_OUTER;
			const y1 = CENTER_Y + Math.sin(rad) * TICK_OUTER;
			const x2 = CENTER_X + Math.cos(rad) * TICK_INNER;
			const y2 = CENTER_Y + Math.sin(rad) * TICK_INNER;

			items.push(
				<line 
					key={`tick-${i}`} 
					x1={x1} y1={y1} x2={x2} y2={y2} 
					stroke={i % 6 === 0 ? "var(--text-secondary)" : "var(--border)"} 
					strokeWidth={i % 6 === 0 ? 3 : 1}
					strokeLinecap="round"
				/>
			);

			if (i % 3 === 0) {
				const labelRad = ((angle) * Math.PI) / 180;
				const lx = CENTER_X + Math.cos(labelRad) * (TICK_INNER - 25);
				const ly = CENTER_Y + Math.sin(labelRad) * (TICK_INNER - 25);
				items.push(
					<text 
						key={`label-${i}`} 
						x={lx} y={ly} 
						textAnchor="middle" 
						dominantBaseline="middle"
						className="clock-label"
					>
						{i === 0 ? "24" : i}
					</text>
				);
			}
		}
		return items;
	}, []);

	// Active block for time hand color
	const activeBlock = blocks.find((block) => {
		if (block.startMinute <= block.endMinute) {
			return currentMinute >= block.startMinute && currentMinute < block.endMinute;
		}
		// Crossover case
		return currentMinute >= block.startMinute || currentMinute < block.endMinute;
	});
	
	const timeHandColor = activeBlock?.color || "var(--primary)";

	const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;
		const rect = svgRef.current.getBoundingClientRect();
		const x = event.clientX - rect.left - CENTER_X;
		const y = event.clientY - rect.top - CENTER_Y;
		
		const distance = Math.sqrt(x * x + y * y);
		const innerR = BLOCK_RADIUS - BLOCK_THICKNESS;
		
		if (distance >= innerR - 20 && distance <= BLOCK_RADIUS + 20) {
			let angle = Math.atan2(y, x) * (180 / Math.PI);
			angle = (angle + 90 + 360) % 360;
			const minute = Math.round((angle / 360) * 1440) % 1440;
			
			const clickedBlock = blocks.find(block => {
				if (block.startMinute <= block.endMinute) {
					return minute >= block.startMinute && minute < block.endMinute;
				}
				return minute >= block.startMinute || minute < block.endMinute;
			});

			if (clickedBlock) {
				onBlockClick(clickedBlock.id);
			} else {
				onEmptyClick(minute);
			}
		}
	};

	return (
		<div className="clock-wrapper-inner">
			<svg
				ref={svgRef}
				width={CLOCK_SIZE}
				height={CLOCK_SIZE}
				viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
				className="clock-svg-premium"
				onClick={handleSvgClick}
			>
				<defs>
					<radialGradient id="clockGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
						<stop offset="0%" stopColor="var(--bg-secondary)" />
						<stop offset="100%" stopColor="white" />
					</radialGradient>
					<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="3" result="blur" />
						<feComposite in="SourceGraphic" in2="blur" operator="over" />
					</filter>
				</defs>

				{/* Arka plan */}
				<circle
					cx={CENTER_X}
					cy={CENTER_Y}
					r={MAIN_CIRCLE_RADIUS}
					fill="url(#clockGradient)"
					className="clock-face"
				/>

				{/* Ticks and Labels */}
				{ticks}

				{/* Routine Blocks */}
				<g className="blocks-group">
					{blocks.map((block) => (
						<motion.path
							key={block.id}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							whileHover={{ opacity: 1, filter: "brightness(1.05)" }}
							d={getBlockArcPath(
								block.startMinute,
								block.endMinute,
								BLOCK_RADIUS,
								BLOCK_THICKNESS,
								CENTER_X,
								CENTER_Y
							)}
							fill={block.color}
							opacity="0.8"
							className="routine-segment"
							onClick={(e) => {
								e.stopPropagation();
								onBlockClick(block.id);
							}}
							style={{ cursor: "pointer" }}
						/>
					))}
				</g>

				{/* Time Hand */}
				<motion.g
					animate={{ rotate: minutesToDegrees(currentMinute) }}
					transition={{ type: "spring", stiffness: 50, damping: 20 }}
					style={{ originX: `${CENTER_X}px`, originY: `${CENTER_Y}px` }}
				>
					<line
						x1={CENTER_X}
						y1={CENTER_Y - MAIN_CIRCLE_RADIUS - 10}
						x2={CENTER_X}
						y2={CENTER_Y}
						stroke={timeHandColor}
						strokeWidth="4"
						strokeLinecap="round"
						filter="url(#glow)"
					/>
					<circle
						cx={CENTER_X}
						cy={CENTER_Y}
						r="8"
						fill="white"
						stroke={timeHandColor}
						strokeWidth="3"
					/>
				</motion.g>
			</svg>
		</div>
	);
};
