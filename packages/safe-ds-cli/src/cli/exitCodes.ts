/**
 * Exit codes for the CLI.
 */
export enum ExitCodes {
    /**
     * Everything went fine.
     */
    Success,

    /**
     * The given path does not exist.
     */
    MissingPath,

    /**
     * The given path is not a file or directory.
     */
    NotAFileOrDirectory,

    /**
     * The given file does not have a Safe-DS extension.
     */
    FileWithoutSafeDsExtension,

    /**
     * The given file has errors.
     */
    FileWithErrors,
}
