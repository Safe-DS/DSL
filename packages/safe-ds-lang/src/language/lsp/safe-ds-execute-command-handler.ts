import { AbstractExecuteCommandHandler, ExecuteCommandAcceptor } from 'langium/lsp';
import { SafeDsSharedServices } from '../safe-ds-module.js';
import { SafeDsRunner } from '../runner/safe-ds-runner.js';

export const COMMAND_RUN_PIPELINE = 'safe-ds.runPipeline';

/* c8 ignore start */
export class SafeDsExecuteCommandHandler extends AbstractExecuteCommandHandler {
    private readonly runner: SafeDsRunner;

    constructor(sharedServices: SafeDsSharedServices) {
        super();

        const services = sharedServices.ServiceRegistry.getSafeDsServices();
        this.runner = services.runtime.Runner;
    }

    override registerCommands(acceptor: ExecuteCommandAcceptor) {
        acceptor(COMMAND_RUN_PIPELINE, ([documentUri, nodePath]) => this.runner.runPipeline(documentUri, nodePath));
    }
}
/* c8 ignore stop */
