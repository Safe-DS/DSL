/* eslint-disable func-style */
type Direction = 'top' | 'right' | 'left' | 'bottom';

function getStyle(direction: Direction): string {
    switch (direction) {
        case 'top':
            return 'absolute z-50 w-full h-3 cursor-ns-resize -top-1 left-0';
        case 'right':
            return 'absolute z-50 h-full w-3 cursor-ew-resize top-0 -right-1';
        case 'left':
            return 'absolute z-50 h-full w-3 cursor-ew-resize top-0 -left-1';
        case 'bottom':
            return 'absolute z-50 w-full h-3 cursor-ns-resize -bottom-1 left-0';
    }
}

type ResizeProps = {
    sides: Direction[];
};

export default function resize(element: HTMLElement, { sides }: ResizeProps) {
    function createDiv(direction: Direction): HTMLDivElement {
        const div = document.createElement('div');
        div.dataset.direction = direction;
        div.className = getStyle(direction);
        return div;
    }

    const grabbers: HTMLDivElement[] = sides.map((side) => {
        const div = createDiv(side);
        element.appendChild(div);
        div.addEventListener('mousedown', onMousedown);
        return div;
    });

    let active: HTMLElement | undefined;
    let initialRect: {
        width: number;
        height: number;
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    let initialPosition: { x: number; y: number };

    function onMousedown(event: MouseEvent) {
        active = event.target! as HTMLElement;
        const rect = element.getBoundingClientRect();
        const parent = element.parentElement!.getBoundingClientRect();

        console.log({ rect, parent });

        initialRect = {
            width: rect.width,
            height: rect.height,
            left: rect.left - parent.left,
            right: parent.right - rect.right,
            top: rect.top - parent.top,
            bottom: parent.bottom - rect.bottom,
        };
        initialPosition = { x: event.pageX, y: event.pageY };
    }

    function onMouseup() {
        if (!active) return;

        active = undefined;
    }

    function onMove(event: MouseEvent) {
        if (!active) return;

        const direction: Direction = active.dataset.direction! as Direction;
        let delta: number;

        switch (direction) {
            case 'top':
                delta = initialPosition.y - event.pageY;
                element.style.top = `${initialRect.top - delta}px`;
                element.style.height = `${initialRect.height + delta}px`;
                break;
            case 'right':
                delta = event.pageX - initialPosition!.x;
                element.style.width = `${initialRect!.width + delta}px`;
                break;
            case 'left':
                delta = initialPosition.x - event.pageX;
                element.style.left = `${initialRect.left - delta}px`;
                element.style.width = `${initialRect.width + delta}px`;
                break;
            case 'bottom':
                delta = event.pageY - initialPosition.y;
                element.style.height = `${initialRect.height + delta}px`;
                break;
        }
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onMouseup);

    return {
        destroy() {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousemove', onMousedown);

            grabbers.forEach((grabber) => {
                element.removeChild(grabber);
            });
        },
    };
}
