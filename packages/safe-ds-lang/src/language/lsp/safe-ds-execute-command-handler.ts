import { AbstractExecuteCommandHandler, ExecuteCommandAcceptor } from 'langium/lsp';
import { SafeDsSharedServices } from '../safe-ds-module.js';
import { SafeDsRunner } from '../runtime/safe-ds-runner.js';
import {
    COMMAND_EXPLORE_TABLE,
    COMMAND_PRINT_VALUE,
    COMMAND_RUN_PIPELINE,
    COMMAND_SHOW_IMAGE,
} from '../communication/commands.js';

/* c8 ignore start */
export class SafeDsExecuteCommandHandler extends AbstractExecuteCommandHandler {
    private readonly runner: SafeDsRunner;

    constructor(sharedServices: SafeDsSharedServices) {
        super();

        const services = sharedServices.ServiceRegistry.getSafeDsServices();
        this.runner = services.runtime.Runner;
    }

    override registerCommands(acceptor: ExecuteCommandAcceptor) {
        acceptor(COMMAND_EXPLORE_TABLE, ([name, [documentUri, nodePath]]) =>
            this.runner.exploreTable(name, documentUri, nodePath),
        );
        acceptor(COMMAND_PRINT_VALUE, ([name, [documentUri, nodePath]]) =>
            this.runner.printValue(name, documentUri, nodePath),
        );
        acceptor(COMMAND_RUN_PIPELINE, ([documentUri, nodePath]) => this.runner.runPipeline(documentUri, nodePath));
        acceptor(COMMAND_SHOW_IMAGE, ([name, [documentUri, nodePath]]) =>
            this.runner.showImage(name, documentUri, nodePath),
        );
    }
}
/* c8 ignore stop */
