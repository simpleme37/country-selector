import { useState, useLayoutEffect } from 'react';

/**
 * 當選單打開時，同步計算展開方向和 maxHeight（在繪製前執行，避免閃爍）
 * @param isOpen
 * @param containerRef
 */
export function useDropdownPositon(
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

            // 預設 dropdown 高度 (search + hint + list)
            const estimatedHeight = 300;

            // 判斷展開方向：下方空間足夠就往下，否則往上
            if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
                setPosition('bottom');
                setMaxHeight(Math.max(200, spaceBelow - 20)); // 留 20px 邊距
            } else {
                setPosition('top');
                setMaxHeight(Math.max(200, spaceAbove - 20));
            }
        }
    }, [isOpen, containerRef]);

    return { position, maxHeight };
}
