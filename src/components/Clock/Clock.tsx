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

const CLOCK_SIZE = 640;
const CENTER_X = CLOCK_SIZE / 2;
const CENTER_Y = CLOCK_SIZE / 2;
const MAIN_CIRCLE_RADIUS = 240; // The "Dome"
const BLOCK_RADIUS = 285; // Outer ring position
const BLOCK_THICKNESS = 8; // Reduced to ~30% of original (from 25 to 8)

export const Clock: React.FC<ClockProps> = ({
	blocks,
	currentMinute,
	onBlockClick,
	onEmptyClick,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);

	// Ticks and Labels (More subtle)
	const ticks = useMemo(() => {
		const items = [];
		for (let i = 0; i < 24; i++) {
			const angle = (i / 24) * 360 - 90;
			
			if (i % 3 === 0) {
				const labelRad = ((angle) * Math.PI) / 180;
				const lx = CENTER_X + Math.cos(labelRad) * (MAIN_CIRCLE_RADIUS - 30);
				const ly = CENTER_Y + Math.sin(labelRad) * (MAIN_CIRCLE_RADIUS - 30);
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

	const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;
		const rect = svgRef.current.getBoundingClientRect();
		const scale = CLOCK_SIZE / rect.width;
		const x = (event.clientX - rect.left) * scale - CENTER_X;
		const y = (event.clientY - rect.top) * scale - CENTER_Y;
		
		const distance = Math.sqrt(x * x + y * y);
		const innerR = BLOCK_RADIUS - BLOCK_THICKNESS;
		
		// If clicked on the segment area
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
					<filter id="domeShadow" x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow dx="0" dy="20" stdDeviation="25" floodColor="rgba(0,0,0,0.12)" />
					</filter>
					
					<radialGradient id="domeGradient" cx="45%" cy="40%" r="60%">
						<stop offset="0%" stopColor="white" />
						<stop offset="100%" stopColor="#f8f9fa" />
					</radialGradient>

					<filter id="glassBloom" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="4" result="blur" />
						<feComposite in="SourceGraphic" in2="blur" operator="over" />
					</filter>
				</defs>

				{/* Glass Outer Ring Background */}
				<circle
					cx={CENTER_X}
					cy={CENTER_Y}
					r={BLOCK_RADIUS - BLOCK_THICKNESS / 2}
					fill="none"
					stroke="rgba(255,255,255,0.15)"
					strokeWidth={BLOCK_THICKNESS + 2}
					className="glass-outer-ring"
				/>

				{/* Routine Blocks (Segments on the ring) */}
				<g className="blocks-group">
					{blocks.map((block) => (
						<motion.path
							key={block.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.8 }}
							whileHover={{ opacity: 1, scale: 1.01 }}
							d={getBlockArcPath(
								block.startMinute,
								block.endMinute,
								BLOCK_RADIUS,
								BLOCK_THICKNESS,
								CENTER_X,
								CENTER_Y
							)}
							fill={block.color}
							className="routine-segment"
							onClick={(e) => {
								e.stopPropagation();
								onBlockClick(block.id);
							}}
						/>
					))}
				</g>

				{/* Main Clock Face (The Dome) */}
				<circle
					cx={CENTER_X}
					cy={CENTER_Y}
					r={MAIN_CIRCLE_RADIUS}
					fill="url(#domeGradient)"
					filter="url(#domeShadow)"
					className="clock-face"
				/>

				{/* Subdued Labels */}
				{ticks}

				{/* 24-Hour Time Indicator - Fixed Centering */}
				<motion.g
					animate={{ rotate: minutesToDegrees(currentMinute) }}
					transition={{ type: "spring", stiffness: 30, damping: 20 }}
					style={{ originX: "320px", originY: "320px" }}
				>
					{/* Invisible background to lock rotation center to SVG center */}
					<rect x="0" y="0" width={CLOCK_SIZE} height={CLOCK_SIZE} fill="transparent" pointerEvents="none" />
					<line
						x1={CENTER_X}
						y1={CENTER_Y - (MAIN_CIRCLE_RADIUS * 0.5)} // R=120
						x2={CENTER_X}
						y2={CENTER_Y - (MAIN_CIRCLE_RADIUS * 0.5) - ( (BLOCK_RADIUS + 10 - MAIN_CIRCLE_RADIUS * 0.5) * 0.5 )} // R ≈ 207
						stroke="rgba(0, 0, 0, 0.4)"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</motion.g>
			</svg>
		</div>
	);
};

