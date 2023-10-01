import path from "path";
import {URI} from "langium";
import {SAFE_DS_FILE_EXTENSIONS} from "../helpers/fileExtensions.js";
import {globSync} from "glob";

let builtinsPath: string;
if (__filename.endsWith('.ts')) {
    // Before running ESBuild
    builtinsPath = path.join(__dirname, '..', '..', 'resources', 'builtins');
} else {
    // After running ESBuild
    /* c8 ignore next 2 */
    builtinsPath = path.join(__dirname, '..', 'resources', 'builtins');
}


/**
 * Lists all Safe-DS files in `src/resources/builtins`.
 *
 * @return URIs of all discovered files.
 */
export const listBuiltinsFiles = (): URI[] => {
    const pattern = `**/*.{${SAFE_DS_FILE_EXTENSIONS.join(',')}}`;
    const relativePaths = globSync(pattern, { cwd: builtinsPath, nodir: true });
    return relativePaths.map((relativePath) => {
        const absolutePath = path.join(builtinsPath, relativePath);
        return URI.file(absolutePath);
    });
};

/**
 * Resolves a relative path to a builtin file.
 *
 * @param relativePath
 */
export const resolveRelativePathToBuiltinFile = (relativePath: string): URI => {
    const absolutePath = path.join(builtinsPath, relativePath);
    return URI.file(absolutePath);
}
