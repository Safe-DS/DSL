/**
 * Exit codes for the CLI.
 */
export enum ExitCode {
    /**
     * Everything went well.
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
    FileHasErrors,
}
