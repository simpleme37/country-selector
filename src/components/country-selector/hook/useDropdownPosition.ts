import { useState, useLayoutEffect } from 'react';

/**
 * 當選單打開時，同步計算展開方向和 maxHeight（在繪製前執行，避免閃爍）
 * @param isOpen
 * @param containerRef
 */
export function useDropdownPosition(
    isOpen: boolean,
    containerRef: React.RefObject<HTMLDivElement | null>
) {
    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
    const [maxHeight, setMaxHeight] = useState<number>(300);

    useLayoutEffect(() => {
        if (isOpen && containerRef.current) {
            const triggerRect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;

            // Dropdown 的高度限制
            const minHeight = 200; // 最小高度
            const maxHeightLimit = 600; // 最大高度限制
            const padding = 20; // 與視窗邊緣的間距

            // 判斷展開方向：下方空間足夠就往下，否則往上
            if (spaceBelow >= maxHeightLimit || spaceBelow >= spaceAbove) {
                setPosition('bottom');
                // 計算可用高度，但不超過最大高度限制
                setMaxHeight(Math.min(maxHeightLimit, Math.max(minHeight, spaceBelow - padding)));
            } else {
                setPosition('top');
                // 計算可用高度，但不超過最大高度限制
                setMaxHeight(Math.min(maxHeightLimit, Math.max(minHeight, spaceAbove - padding)));
            }
        }
    }, [isOpen, containerRef]);

    return { position, maxHeight };
}
