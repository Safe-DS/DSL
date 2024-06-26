import { AstNode, AstUtils, LangiumDocument } from 'langium';

/**
 * Marks the file as a pipeline file, which can be executed by our runtime component.
 *
 * @see isInPipelineFile
 * @see isPipelineFile
 */
export const PIPELINE_FILE_EXTENSION = 'sds';

/**
 * Marks the file as a stub file, which describes an external API.
 *
 * @see isInStubFile
 * @see isStubFile
 */
export const STUB_FILE_EXTENSION = 'sdsstub';

/**
 * Marks the file as a dev file, which disables some checks to simplify its use as input of test cases. This file
 * type is only used by language developers.
 *
 * @see isInDevFile
 * @see isDevFile
 */
export const DEV_FILE_EXTENSION = 'sdsdev';

/**
 * All file extensions that are supported by the Safe-DS language.
 */
export const SAFE_DS_FILE_EXTENSIONS = [PIPELINE_FILE_EXTENSION, STUB_FILE_EXTENSION, DEV_FILE_EXTENSION];

/**
 * All file extensions that are supported by the Safe-DS language.
 */
export type SdSFileExtension = typeof PIPELINE_FILE_EXTENSION | typeof STUB_FILE_EXTENSION | typeof DEV_FILE_EXTENSION;

/**
 * Returns whether the object is contained in a pipeline file.
 */
export const isInPipelineFile = (node: AstNode | undefined) => node && isPipelineFile(AstUtils.getDocument(node));

/**
 * Returns whether the object is contained in a stub file.
 */
export const isInStubFile = (node: AstNode | undefined) => node && isStubFile(AstUtils.getDocument(node));

/**
 * Returns whether the object is contained in a dev file.
 */
export const isInDevFile = (node: AstNode | undefined) => node && isDevFile(AstUtils.getDocument(node));

/**
 * Returns whether the resource represents a pipeline file.
 */
export const isPipelineFile = (document: LangiumDocument) => hasExtension(document, PIPELINE_FILE_EXTENSION);

/**
 * Returns whether the resource represents a stub file.
 */
export const isStubFile = (document: LangiumDocument) => hasExtension(document, STUB_FILE_EXTENSION);

/**
 * Returns whether the resource represents a dev file.
 */
export const isDevFile = (document: LangiumDocument) => hasExtension(document, DEV_FILE_EXTENSION);

/**
 * Returns whether the resource represents a file with the given extension.
 */
const hasExtension = (document: LangiumDocument, extension: SdSFileExtension) =>
    document.uri.path.endsWith(`.${extension}`);
