/**
 * useRoutineBlocks Hook
 * Manages routine blocks state and persistence
 */

import { useState, useCallback } from "react";
import type { RoutineBlock } from "../types/models";
import { getBlocks, saveBlocks } from "../services/storageService";

interface UseRoutineBlocksReturn {
	blocks: RoutineBlock[];
	addBlock: (block: RoutineBlock) => void;
	updateBlock: (id: string, updates: Partial<RoutineBlock>) => void;
	deleteBlock: (id: string) => void;
	setBlocks: (blocks: RoutineBlock[]) => void;
}

export const useRoutineBlocks = (): UseRoutineBlocksReturn => {
	const [blocks, setBlocksState] = useState<RoutineBlock[]>(() => {
		return getBlocks();
	});

	const setBlocks = useCallback((newBlocks: RoutineBlock[]) => {
		setBlocksState(newBlocks);
		saveBlocks(newBlocks);
	}, []);

	const addBlock = useCallback(
		(block: RoutineBlock) => {
			const updatedBlocks = [...blocks, block];
			setBlocks(updatedBlocks);
		},
		[blocks, setBlocks]
	);

	const updateBlock = useCallback(
		(id: string, updates: Partial<RoutineBlock>) => {
			const updatedBlocks = blocks.map((block) =>
				block.id === id ? { ...block, ...updates } : block
			);
			setBlocks(updatedBlocks);
		},
		[blocks, setBlocks]
	);

	const deleteBlock = useCallback(
		(id: string) => {
			const updatedBlocks = blocks.filter((block) => block.id !== id);
			setBlocks(updatedBlocks);
		},
		[blocks, setBlocks]
	);

	return {
		blocks,
		addBlock,
		updateBlock,
		deleteBlock,
		setBlocks,
	};
};
