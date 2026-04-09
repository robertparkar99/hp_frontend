import { useRef, useCallback, useEffect } from "react";

export interface TransformState {
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    rotation: number;
    zIndex: number;
    scaleMultiplier: number;
}

export interface UseOverlayTransformProps {
    initialX?: number;
    initialY?: number;
    initialWidth?: number | string;
    initialHeight?: number | string;
    initialRotation?: number;
    initialZIndex?: number;
    onTransformEnd?: (state: TransformState) => void;
    getMaxZIndex?: () => number;
}

function rotateVector(dx: number, dy: number, angleDegrees: number) {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
        x: dx * cos - dy * sin,
        y: dx * sin + dy * cos,
    };
}

function computeAnchoredPosition(
    oldX: number, oldY: number,
    oldW: number, oldH: number,
    newW: number, newH: number,
    theta: number,
    anchorX: number, anchorY: number
) {
    const dW = newW - oldW;
    const dH = newH - oldH;

    const centerShiftLocalX = -anchorX * (dW / 2);
    const centerShiftLocalY = -anchorY * (dH / 2);

    const centerShiftGlobal = rotateVector(centerShiftLocalX, centerShiftLocalY, theta);

    const newX = oldX + centerShiftGlobal.x - dW / 2;
    const newY = oldY + centerShiftGlobal.y - dH / 2;

    return { x: newX, y: newY };
}

const dirMultipliers: Record<string, { mx: number, my: number, ax: number, ay: number }> = {
    nw: { mx: -1, my: -1, ax: 1, ay: 1 },
    ne: { mx: 1, my: -1, ax: -1, ay: 1 },
    sw: { mx: -1, my: 1, ax: 1, ay: -1 },
    se: { mx: 1, my: 1, ax: -1, ay: -1 },
    n: { mx: 0, my: -1, ax: 0, ay: 1 },
    s: { mx: 0, my: 1, ax: 0, ay: -1 },
    e: { mx: 1, my: 0, ax: -1, ay: 0 },
    w: { mx: -1, my: 0, ax: 1, ay: 0 },
};

export function useOverlayTransform({
    initialX = 0,
    initialY = 0,
    initialWidth = "100%",
    initialHeight = "100%",
    initialRotation = 0,
    initialZIndex = 10,
    onTransformEnd,
    getMaxZIndex
}: UseOverlayTransformProps) {
    const domRef = useRef<HTMLDivElement>(null);

    const state = useRef<TransformState>({
        x: initialX,
        y: initialY,
        width: initialWidth,
        height: initialHeight,
        rotation: initialRotation,
        zIndex: initialZIndex,
        scaleMultiplier: 1,
    });

    const applyTransform = useCallback(() => {
        if (!domRef.current) return;
        const { x, y, width, height, rotation, zIndex, scaleMultiplier } = state.current;
        domRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
        domRef.current.style.zIndex = zIndex.toString();
        domRef.current.style.width = typeof width === 'number' ? `${width}px` : width;
        domRef.current.style.height = typeof height === 'number' ? `${height}px` : height;
        domRef.current.style.transformOrigin = "center center";
        domRef.current.style.willChange = "transform, width, height";
        domRef.current.style.setProperty('--scale-multiplier', String(scaleMultiplier));
    }, []);

    useEffect(() => {
        state.current = {
            ...state.current,
            x: initialX,
            y: initialY,
            width: initialWidth,
            height: initialHeight,
            rotation: initialRotation,
            zIndex: initialZIndex,
            scaleMultiplier: 1,
        };
        applyTransform();
    }, [initialX, initialY, initialWidth, initialHeight, initialRotation, initialZIndex, applyTransform]);

    const isInteracting = useRef<"move" | "resize" | "rotate" | false>(false);
    const interactionStartPos = useRef({ x: 0, y: 0 });
    const originalState = useRef({ ...state.current });
    const baseDimensions = useRef({ width: 0, height: 0, cx: 0, cy: 0 });
    const interactionDirection = useRef<string>("se");
    const initialRotationAngle = useRef<number>(0);
    const rAF = useRef<number | null>(null);
    const notifyDragStart = useCallback(() => {
        if (domRef.current) {
            domRef.current.dispatchEvent(new CustomEvent('craft-drag-start', { bubbles: true }));
        }
    }, []);

    const setElevatedZIndex = useCallback(() => {
        if (getMaxZIndex) {
            state.current.zIndex = getMaxZIndex() + 1;
            applyTransform();
        }
    }, [getMaxZIndex, applyTransform]);

    // ==== MOVE ====
    // Deferred drag: on pointerdown we only record the start position.
    // We do NOT stopPropagation or setPointerCapture yet, so Craft.js
    // can still receive the click for node selection.
    // Only once the user drags past a 5px threshold do we commit to "move" mode.
    const DRAG_THRESHOLD = 5;
    const pendingMove = useRef<{ startX: number; startY: number; pointerId: number; target: HTMLElement } | null>(null);

    const handleMoveStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!domRef.current) return;
        const target = e.target as HTMLElement;
        const isMoveHandle = !!target.closest(".move-handle");
        
        // Disable body-drag if actively editing text or selecting inside an input
        if (!isMoveHandle) {
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable ||
                target.closest('[contenteditable="true"]')
            ) {
                return;
            }
        }

        // For explicit move-handles, start move immediately
        if (isMoveHandle) {
            e.stopPropagation();
            target.setPointerCapture(e.pointerId);
            isInteracting.current = "move";
            interactionStartPos.current = { x: e.clientX, y: e.clientY };
            state.current.scaleMultiplier = 1;
            originalState.current = { ...state.current };
            setElevatedZIndex();
            notifyDragStart();
            document.body.style.userSelect = "none";
            return;
        }

        // For body clicks, defer — just record the start position
        pendingMove.current = { startX: e.clientX, startY: e.clientY, pointerId: e.pointerId, target };
    }, [setElevatedZIndex]);

    const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        // Check if we have a pending move that needs to be promoted to a real drag
        if (pendingMove.current && isInteracting.current !== "move") {
            const dx = e.clientX - pendingMove.current.startX;
            const dy = e.clientY - pendingMove.current.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance >= DRAG_THRESHOLD) {
                // Promote to real move interaction
                const pending = pendingMove.current;
                pendingMove.current = null;

                try {
                    pending.target.setPointerCapture(pending.pointerId);
                } catch (_) { /* element may have been replaced by React */ }

                isInteracting.current = "move";
                interactionStartPos.current = { x: pending.startX, y: pending.startY };
                state.current.scaleMultiplier = 1;
                originalState.current = { ...state.current };
                setElevatedZIndex();
                notifyDragStart();
                document.body.style.userSelect = "none";
            } else {
                return; // Haven't reached threshold yet
            }
        }

        if (isInteracting.current !== "move" || !domRef.current) return;
        e.stopPropagation();

        const zoom = (window as any).__craft_zoom || 1;
        const dx = (e.clientX - interactionStartPos.current.x) / zoom;
        const dy = (e.clientY - interactionStartPos.current.y) / zoom;

        let tempX = Number(originalState.current.x) + dx;
        let tempY = Number(originalState.current.y) + dy;
        
        if (isNaN(tempX)) tempX = 0;
        if (isNaN(tempY)) tempY = 0;

        const A4_WIDTH = 794;
        const A4_HEIGHT = 1123;
        const elemWidth = Number(typeof state.current.width === 'number' ? state.current.width : domRef.current.offsetWidth) || 100;
        const elemHeight = Number(typeof state.current.height === 'number' ? state.current.height : domRef.current.offsetHeight) || 100;

        const maxAllowedX = Math.max(0, A4_WIDTH - elemWidth);
        const maxAllowedY = Math.max(0, A4_HEIGHT - elemHeight);

        tempX = Math.max(0, Math.min(tempX, maxAllowedX));
        tempY = Math.max(0, Math.min(tempY, maxAllowedY));

        state.current.x = tempX;
        state.current.y = tempY;

        if (rAF.current === null) {
            rAF.current = requestAnimationFrame(() => {
                applyTransform();
                rAF.current = null;
            });
        }
    }, [applyTransform, setElevatedZIndex]);

    // ==== RESIZE ====
    const handleResizeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!domRef.current) return;
        e.stopPropagation();
        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);

        isInteracting.current = "resize";
        interactionDirection.current = target.getAttribute("data-dir") || "se";
        interactionStartPos.current = { x: e.clientX, y: e.clientY };
        state.current.scaleMultiplier = 1;
        originalState.current = { ...state.current };
        setElevatedZIndex();

        const unscaledW = domRef.current.offsetWidth;
        const unscaledH = domRef.current.offsetHeight;
        baseDimensions.current = { width: unscaledW, height: unscaledH, cx: 0, cy: 0 };

        document.body.style.userSelect = "none";
    }, [setElevatedZIndex]);

    const handleResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (isInteracting.current !== "resize" || !domRef.current) return;
        e.stopPropagation();

        const zoom = (window as any).__craft_zoom || 1;
        const rawDx = (e.clientX - interactionStartPos.current.x) / zoom;
        const rawDy = (e.clientY - interactionStartPos.current.y) / zoom;

        const { mx, my, ax, ay } = dirMultipliers[interactionDirection.current];
        const localDelta = rotateVector(rawDx, rawDy, -originalState.current.rotation);

        let dW = localDelta.x * mx;
        let dH = localDelta.y * my;

        const isCorner = interactionDirection.current.length === 2;
        if (isCorner) {
            // PROPORTIONAL ASPECT RATIO PROJECTOR
            // Project the user's localized delta distance perfectly onto the diagonal aspect ratio line
            // for flawless Canva-smooth corner scaling stretching
            const basew = baseDimensions.current.width;
            const baseh = baseDimensions.current.height;
            const mag = Math.sqrt(basew * basew + baseh * baseh);
            const ux = basew / mag;
            const uy = baseh / mag;

            const proj_mag = dW * ux + dH * uy;
            dW = proj_mag * ux;
            dH = proj_mag * uy;

            const scale = (basew + dW) / basew;
            state.current.scaleMultiplier = scale;
        } else {
            state.current.scaleMultiplier = 1;
        }

        // Shift constrain / min bounds
        const MIN_SIZE = 10;
        if (baseDimensions.current.width + dW < MIN_SIZE) {
            dW = MIN_SIZE - baseDimensions.current.width;
        }
        if (baseDimensions.current.height + dH < MIN_SIZE) {
            dH = MIN_SIZE - baseDimensions.current.height;
        }

        const newW = Number(baseDimensions.current.width) + dW;
        const newH = Number(baseDimensions.current.height) + dH;

        const { x: newX, y: newY } = computeAnchoredPosition(
            Number(originalState.current.x), Number(originalState.current.y),
            Number(baseDimensions.current.width), Number(baseDimensions.current.height),
            newW, newH,
            Number(originalState.current.rotation),
            ax, ay
        );

        const A4_WIDTH = 794;
        const A4_HEIGHT = 1123;

        // Structural bounds clamping for Resize
        let clampedW = newW;
        let clampedH = newH;
        let clampedX = newX;
        let clampedY = newY;

        // Prevent pushing left/top out of bounds
        if (clampedX < 0) {
            clampedW += clampedX; // shrink width by overflow amount
            clampedX = 0;
        }
        if (clampedY < 0) {
            clampedH += clampedY; // shrink height by overflow amount
            clampedY = 0;
        }

        // Prevent pushing right/bottom out of bounds
        if (clampedX + clampedW > A4_WIDTH) {
            clampedW = A4_WIDTH - clampedX;
        }
        if (clampedY + clampedH > A4_HEIGHT) {
            clampedH = A4_HEIGHT - clampedY;
        }

        state.current.width = Math.max(MIN_SIZE, clampedW);
        state.current.height = Math.max(MIN_SIZE, clampedH);
        state.current.x = clampedX;
        state.current.y = clampedY;

        if (rAF.current === null) {
            rAF.current = requestAnimationFrame(() => {
                applyTransform();
                rAF.current = null;
            });
        }
    }, [applyTransform]);

    // ==== ROTATE ====
    const handleRotateStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!domRef.current) return;
        e.stopPropagation();
        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);

        isInteracting.current = "rotate";
        originalState.current = { ...state.current };
        setElevatedZIndex();

        const rect = domRef.current.getBoundingClientRect();
        baseDimensions.current.cx = rect.left + rect.width / 2;
        baseDimensions.current.cy = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - baseDimensions.current.cy, e.clientX - baseDimensions.current.cx);
        initialRotationAngle.current = (angle * 180) / Math.PI;

        document.body.style.userSelect = "none";
    }, [setElevatedZIndex]);

    const handleRotate = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (isInteracting.current !== "rotate" || !domRef.current) return;
        e.stopPropagation();

        const angle = Math.atan2(e.clientY - baseDimensions.current.cy, e.clientX - baseDimensions.current.cx);
        const degrees = (angle * 180) / Math.PI;

        const deltaAngle = degrees - initialRotationAngle.current;
        state.current.rotation = originalState.current.rotation + deltaAngle;

        if (rAF.current === null) {
            rAF.current = requestAnimationFrame(() => {
                applyTransform();
                rAF.current = null;
            });
        }
    }, [applyTransform]);

    // ==== END ====
    const handleEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        // Clear any pending move that never promoted to a real drag
        pendingMove.current = null;

        if (!isInteracting.current || !domRef.current) return;
        e.stopPropagation();
        const target = e.target as HTMLElement;
        try { target.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }

        document.body.style.userSelect = "";

        if (rAF.current !== null) {
            cancelAnimationFrame(rAF.current);
            rAF.current = null;
        }

        isInteracting.current = false;

        if (onTransformEnd) {
            const finalState: TransformState = {
                x: state.current.x,
                y: state.current.y,
                width: state.current.width,
                height: state.current.height,
                rotation: state.current.rotation,
                zIndex: state.current.zIndex,
                scaleMultiplier: state.current.scaleMultiplier,
            };
            onTransformEnd(finalState);
        }

        state.current.scaleMultiplier = 1;
        applyTransform();
    }, [onTransformEnd, applyTransform]);

    return {
        domRef,
        handlers: {
            onPointerDown: handleMoveStart,
            onPointerMove: handleMove,
            onPointerUp: handleEnd,
            onPointerCancel: handleEnd
        },
        controls: {
            onResizeStart: handleResizeStart,
            onResizeMove: handleResize,
            onRotateStart: handleRotateStart,
            onRotateMove: handleRotate
        },
        state
    };
}
