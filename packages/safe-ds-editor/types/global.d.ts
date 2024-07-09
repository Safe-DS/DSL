export class CustomError {
    constructor(
        public readonly action: 'block' | 'notify',
        public readonly message: string,
    ) {}
}
