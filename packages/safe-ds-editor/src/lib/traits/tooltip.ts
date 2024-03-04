function getStyle(): string {
    return 'absolute bg-neutral-700 bg-opacity-80 text-opacity-80 p-1';
}

function createTooltip(content: string) {
    const div = document.createElement('div');
    div.className = getStyle();
    div.textContent = content;
    div.style.display = 'none';
    document.body.appendChild(div);
    return div;
}

type TooltipProps = {
    content: string;
    delay: number;
};

export default function tooltip(
    element: HTMLSpanElement,
    { content, delay = 0 }: TooltipProps,
) {
    const tooltip: HTMLElement = createTooltip(content);
    let timeoutId: number | null = null;
    let dragging: boolean = false;

    function mouseEnter(event: MouseEvent) {
        const dimensionsTarget = element.getBoundingClientRect();
        if (dragging) {
            return;
        }
        timeoutId = window.setTimeout(() => {
            tooltip.style.display = 'block';
            const xOffset = -(tooltip.getBoundingClientRect().width / 2);

            const x = dimensionsTarget.x + dimensionsTarget.width / 2 + xOffset;
            const y = window.innerHeight - dimensionsTarget.y + 5;
            tooltip.style.bottom = `${y}px`;
            tooltip.style.left = `${x}px`;
        }, delay);
    }

    function mouseLeave(event: MouseEvent) {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        tooltip.style.display = 'none';
    }

    function mouseDown(event: MouseEvent) {
        dragging = true;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        tooltip.style.display = 'none';
    }

    function pointerUp(event: MouseEvent) {
        dragging = false;
    }

    element.addEventListener('mouseenter', mouseEnter);
    element.addEventListener('mouseleave', mouseLeave);
    element.addEventListener('mousedown', mouseDown);
    window.addEventListener('pointerup', pointerUp);

    return {
        destroy() {
            element.removeEventListener('mouseenter', mouseEnter);
            element.removeEventListener('mouseleave', mouseLeave);
            element.removeEventListener('mousedown', mouseDown);
            window.removeEventListener('pointerup', pointerUp);
            tooltip.remove();
        },
    };
}
