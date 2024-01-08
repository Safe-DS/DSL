/**
 * Exit codes for the CLI.
 */
export enum ExitCode {
    /**
     * Everything went well.
     */
    Success = 0,

    /**
     * The given path does not exist.
     */
    MissingPath = 100,

    /**
     * The given path is not a file or directory.
     */
    NotAFileOrDirectory = 101,

    /**
     * The given file does not have a Safe-DS extension.
     */
    FileWithoutSafeDsExtension = 102,

    /**
     * The given file has errors.
     */
    FileHasErrors = 103,
}
