export const RPC_RUNNER_INSTALL = 'runner/install';
export const RPC_RUNNER_START = 'runner/start';
export const RPC_RUNNER_STARTED = 'runner/started';
export const RPC_RUNNER_UPDATE = 'runner/update';
export const RPC_RUNNER_SHOW_IMAGE = 'runner/showImage';

/**
 * JSON representation of an image.
 */
export interface ImageJson {
    /**
     * The format of the image.
     */
    format: 'png';

    /**
     * The Base64-encoded image.
     */
    bytes: string;
}
