import {
    AstNode,
    AstNodeLocator,
    AstUtils,
    CstUtils,
    LangiumDocument,
    LangiumDocuments,
    ReferenceDescription,
    Stream,
    URI,
} from 'langium';
import { Position, RenameParams, TextEdit, WorkspaceEdit } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { isSdsImportedDeclaration, isSdsModule } from '../generated/ast.js';
import { getImportedDeclarations } from '../helpers/nodeProperties.js';
import { DefaultRenameProvider } from 'langium/lsp';

export class SafeDsRenameProvider extends DefaultRenameProvider {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly langiumDocuments: LangiumDocuments;

    constructor(services: SafeDsServices) {
        super(services);

        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
    }

    override async rename(document: LangiumDocument, params: RenameParams): Promise<WorkspaceEdit | undefined> {
        const references = this.findReferencesToRename(document, params.position);
        return this.createWorkspaceEdit(references, params.newName);
    }

    private findReferencesToRename(
        document: LangiumDocument,
        position: Position,
    ): Stream<ReferenceDescription> | undefined {
        const rootNode = document.parseResult.value.$cstNode;
        if (!rootNode) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const offset = document.textDocument.offsetAt(position);
        const leafNode = CstUtils.findDeclarationNodeAtOffset(rootNode, offset, this.grammarConfig.nameRegexp);
        if (!leafNode) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const targetNode = this.references.findDeclaration(leafNode);
        if (!targetNode) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const options = { onlyLocal: false, includeDeclaration: true };
        return this.references.findReferences(targetNode, options).filter((ref) => this.mustBeRenamed(ref));
    }

    private mustBeRenamed(ref: ReferenceDescription): boolean {
        // References in the same file must always be renamed
        if (ref.local) {
            return true;
        }

        // References in imported declaration nodes must always be renamed
        const sourceNode = this.getAstNode(ref.sourceUri, ref.sourcePath);
        if (isSdsImportedDeclaration(sourceNode)) {
            return true;
        }

        // Other references must be renamed unless they are imported under an alias
        const sourceModule = AstUtils.getContainerOfType(sourceNode, isSdsModule);
        if (!sourceModule) {
            /* c8 ignore next 2 */
            return false;
        }

        const referenceText = this.getReferenceText(ref);
        if (!referenceText) {
            /* c8 ignore next 2 */
            return false;
        }

        const targetNode = this.getAstNode(ref.targetUri, ref.targetPath);
        return !getImportedDeclarations(sourceModule).some((imp) => {
            return imp.declaration?.ref === targetNode && imp.alias?.alias === referenceText;
        });
    }

    private getAstNode(uri: URI, path: string): AstNode | undefined {
        const document = this.langiumDocuments.getDocument(uri);
        if (!document) {
            /* c8 ignore next 2 */
            return undefined;
        }

        return this.astNodeLocator.getAstNode(document.parseResult.value, path);
    }

    private getReferenceText(ref: ReferenceDescription): string | undefined {
        const document = this.langiumDocuments.getDocument(ref.sourceUri);
        if (!document) {
            /* c8 ignore next 2 */
            return undefined;
        }

        return document.textDocument.getText(ref.segment.range);
    }

    private createWorkspaceEdit(
        references: Stream<ReferenceDescription> | undefined,
        newName: string,
    ): WorkspaceEdit | undefined {
        if (!references) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const changes: Record<string, TextEdit[]> = {};

        references.forEach((ref) => {
            const change = TextEdit.replace(ref.segment.range, newName);
            const uri = ref.sourceUri.toString();
            if (!changes[uri]) {
                changes[uri] = [];
            }

            changes[uri]!.push(change);
        });

        return { changes };
    }
}
