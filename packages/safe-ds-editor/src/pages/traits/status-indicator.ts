/* eslint-disable func-style */

type NodeStatus = 'ready' | 'queued' | 'done' | 'error';

function getStyle(status: NodeStatus): string {
    let className: string;
    switch (status) {
        case 'ready':
            className = ' bg-neutral-400';
            return className;
        case 'queued':
            className = ' bg-yellow-500';
            return className;
        case 'done':
            className = ' bg-green-400';
            return className;
        case 'error':
            className = ' bg-red-600';
            return className;
        default:
            return 'bg-neutral-400';
    }
}

type StatusProps = {
    status: NodeStatus;
};

export default function statusIndicator(
    element: HTMLElement,
    { status }: StatusProps,
) {
    element.className += getStyle(status);
}
