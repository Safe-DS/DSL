function getStyle(): string {
    const className =
        'absolute bg-neutral-700 p-1 -top-12 left-1/2 transform -translate-x-1/2';
    return className;
}

function createTooltip(content: string) {
    const div = document.createElement('div');
    div.className = getStyle();
    div.innerHTML = tooltipArrow + content;
    div.style.display = 'none';
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
    element.appendChild(tooltip);

    let timeoutId: number | null = null;
    let dragging: boolean = false;

    function mouseEnter(event: MouseEvent) {
        if (dragging) {
            return;
        }
        timeoutId = window.setTimeout(() => {
            tooltip.style.display = 'block';
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

const tooltipArrow = `<svg
class="w-5 h-5 absolute -bottom-[11px] left-1/2 transform -translate-x-1/2 rotate-180"
viewBox="0 0 512 512"
transform="rotate(180)"
>
<g id="SVGRepo_bgCarrier" stroke-width="0" />
<g
    id="SVGRepo_tracerCarrier"
    stroke-linecap="round"
    stroke-linejoin="round"
/>
<g id="SVGRepo_iconCarrier">
    <g
        id="Page-1"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
    >
        <g
            id="drop"
            class="fill-neutral-700"
            transform="translate(32.000000, 42.666667)"
        >
            <path
                d="M246.312928,5.62892705 C252.927596,9.40873724 258.409564,14.8907053 262.189374,21.5053731 L444.667042,340.84129 C456.358134,361.300701 449.250007,387.363834 428.790595,399.054926 C422.34376,402.738832 415.04715,404.676552 407.622001,404.676552 L42.6666667,404.676552 C19.1025173,404.676552 7.10542736e-15,385.574034 7.10542736e-15,362.009885 C7.10542736e-15,354.584736 1.93772021,347.288125 5.62162594,340.84129 L188.099293,21.5053731 C199.790385,1.04596203 225.853517,-6.06216498 246.312928,5.62892705 Z"
                id="Combined-Shape"
            >
            </path>
        </g>
    </g>
</g>
</svg>`;
