export type Error = {
    action: 'block' | 'notify';
    source: string;
    message: string;
};
