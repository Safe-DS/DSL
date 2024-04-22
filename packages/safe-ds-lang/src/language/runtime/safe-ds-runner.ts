import { SafeDsServices } from '../safe-ds-module.js';
import { AstNodeLocator, AstUtils, LangiumDocument, LangiumDocuments, URI } from 'langium';
import path from 'path';
import {
    createPlaceholderQueryMessage,
    createProgramMessage,
    PlaceholderValueMessage,
    ProgramCodeMap,
    RuntimeErrorBacktraceFrame,
    RuntimeErrorMessage,
} from './messages.js';
import { SourceMapConsumer } from 'source-map-js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { SafeDsPythonGenerator } from '../generation/safe-ds-python-generator.js';
import { isSdsModule, isSdsPipeline, isSdsPlaceholder } from '../generated/ast.js';
import { SafeDsLogger, SafeDsMessagingProvider } from '../communication/safe-ds-messaging-provider.js';
import crypto from 'crypto';
import { SafeDsPythonServer } from './safe-ds-python-server.js';
import { IsRunnerReadyRequest, ShowImageNotification } from '../communication/rpc.js';
import { expandToStringLF, joinToNode } from 'langium/generate';

// Most of the functionality cannot be tested automatically as a functioning runner setup would always be required

const RUNNER_TAG = 'Runner';

/* c8 ignore start */
export class SafeDsRunner {
    private readonly annotations: SafeDsAnnotations;
    private readonly astNodeLocator: AstNodeLocator;
    private readonly generator: SafeDsPythonGenerator;
    private readonly langiumDocuments: LangiumDocuments;
    private readonly logger: SafeDsLogger;
    private readonly messaging: SafeDsMessagingProvider;
    private readonly pythonServer: SafeDsPythonServer;

    constructor(services: SafeDsServices) {
        this.annotations = services.builtins.Annotations;
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.generator = services.generation.PythonGenerator;
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
        this.logger = services.communication.MessagingProvider.createTaggedLogger(RUNNER_TAG);
        this.messaging = services.communication.MessagingProvider;
        this.pythonServer = services.runtime.PythonServer;

        this.registerMessageLoggingCallbacks();

        this.messaging.onRequest(IsRunnerReadyRequest.type, () => {
            return this.isReady();
        });
    }

    /**
     * Check if the runner is ready to execute pipelines.
     */
    isReady(): boolean {
        return this.pythonServer.isStarted;
    }

    async runPipeline(documentUri: string, nodePath: string) {
        const uri = URI.parse(documentUri);
        const document = this.langiumDocuments.getDocument(uri);
        if (!document) {
            this.messaging.showErrorMessage('Could not find document.');
            return;
        }

        const root = document.parseResult.value;
        const pipeline = this.astNodeLocator.getAstNode(root, nodePath);
        if (!isSdsPipeline(pipeline)) {
            this.messaging.showErrorMessage('Selected node is not a pipeline.');
            return;
        }

        const pipelineExecutionId = crypto.randomUUID();

        const start = Date.now();
        const progress = await this.messaging.showProgress('Safe-DS Runner', 'Starting...');
        this.logger.info(`[${pipelineExecutionId}] Running pipeline "${pipeline.name}" in ${documentUri}.`);

        const disposables = [
            this.pythonServer.addMessageCallback('placeholder_type', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress.report(`Computed ${message.data.name}`);
                }
            }),

            this.pythonServer.addMessageCallback('runtime_error', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress?.done();
                    disposables.forEach((it) => {
                        it.dispose();
                    });
                    this.messaging.showErrorMessage('An error occurred during pipeline execution.');
                }
                progress.done();
                disposables.forEach((it) => {
                    it.dispose();
                });
            }),

            this.pythonServer.addMessageCallback('runtime_progress', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress.done();
                    const timeElapsed = Date.now() - start;
                    this.logger.info(
                        `[${pipelineExecutionId}] Finished running pipeline "${pipeline.name}" in ${timeElapsed}ms.`,
                    );
                    disposables.forEach((it) => {
                        it.dispose();
                    });
                }
            }),
        ];

        await this.executePipeline(pipelineExecutionId, document, pipeline.name);
    }

    async printValue(documentUri: string, nodePath: string) {
        const uri = URI.parse(documentUri);
        const document = this.langiumDocuments.getDocument(uri);
        if (!document) {
            this.messaging.showErrorMessage('Could not find document.');
            return;
        }

        const root = document.parseResult.value;
        const placeholder = this.astNodeLocator.getAstNode(root, nodePath);
        if (!isSdsPlaceholder(placeholder)) {
            this.messaging.showErrorMessage('Selected node is not a placeholder.');
            return;
        }

        const pipeline = AstUtils.getContainerOfType(placeholder, isSdsPipeline);
        if (!pipeline) {
            this.messaging.showErrorMessage('Could not find pipeline.');
            return;
        }

        const pipelineExecutionId = crypto.randomUUID();

        const start = Date.now();

        const progress = await this.messaging.showProgress('Safe-DS Runner', 'Starting...');

        this.logger.info(
            `[${pipelineExecutionId}] Showing image "${pipeline.name}/${placeholder.name}" in ${documentUri}.`,
        );

        const disposables = [
            this.pythonServer.addMessageCallback('runtime_error', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress?.done();
                    disposables.forEach((it) => {
                        it.dispose();
                    });
                    this.messaging.showErrorMessage('An error occurred during pipeline execution.');
                }
                progress.done();
                disposables.forEach((it) => {
                    it.dispose();
                });
            }),

            this.pythonServer.addMessageCallback('placeholder_type', async (message) => {
                if (message.id === pipelineExecutionId && message.data.name === placeholder.name) {
                    const data = await this.getPlaceholderValue(placeholder.name, pipelineExecutionId);
                    this.logger.result(`val ${placeholder.name} = ${JSON.stringify(data, null, 2)};`);
                }
            }),

            this.pythonServer.addMessageCallback('runtime_progress', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress.done();
                    const timeElapsed = Date.now() - start;
                    this.logger.info(
                        `[${pipelineExecutionId}] Finished printing value "${pipeline.name}/${placeholder.name}" in ${timeElapsed}ms.`,
                    );
                    disposables.forEach((it) => {
                        it.dispose();
                    });
                }
            }),
        ];

        await this.executePipeline(pipelineExecutionId, document, pipeline.name, placeholder.name);
    }

    async showImage(documentUri: string, nodePath: string) {
        const uri = URI.parse(documentUri);
        const document = this.langiumDocuments.getDocument(uri);
        if (!document) {
            this.messaging.showErrorMessage('Could not find document.');
            return;
        }

        const root = document.parseResult.value;
        const placeholder = this.astNodeLocator.getAstNode(root, nodePath);
        if (!isSdsPlaceholder(placeholder)) {
            this.messaging.showErrorMessage('Selected node is not a placeholder.');
            return;
        }

        const pipeline = AstUtils.getContainerOfType(placeholder, isSdsPipeline);
        if (!pipeline) {
            this.messaging.showErrorMessage('Could not find pipeline.');
            return;
        }

        const pipelineExecutionId = crypto.randomUUID();

        const start = Date.now();

        const progress = await this.messaging.showProgress('Safe-DS Runner', 'Starting...');

        this.logger.info(
            `[${pipelineExecutionId}] Showing image "${pipeline.name}/${placeholder.name}" in ${documentUri}.`,
        );

        const disposables = [
            this.pythonServer.addMessageCallback('runtime_error', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress?.done();
                    disposables.forEach((it) => {
                        it.dispose();
                    });
                    this.messaging.showErrorMessage('An error occurred during pipeline execution.');
                }
                progress.done();
                disposables.forEach((it) => {
                    it.dispose();
                });
            }),

            this.pythonServer.addMessageCallback('placeholder_type', async (message) => {
                if (message.id === pipelineExecutionId && message.data.name === placeholder.name) {
                    const data = await this.getPlaceholderValue(placeholder.name, pipelineExecutionId);
                    await this.messaging.sendNotification(ShowImageNotification.type, { image: data });
                }
            }),

            this.pythonServer.addMessageCallback('runtime_progress', (message) => {
                if (message.id === pipelineExecutionId) {
                    progress.done();
                    const timeElapsed = Date.now() - start;
                    this.logger.info(
                        `[${pipelineExecutionId}] Finished showing image "${pipeline.name}/${placeholder.name}" in ${timeElapsed}ms.`,
                    );
                    disposables.forEach((it) => {
                        it.dispose();
                    });
                }
            }),
        ];

        await this.executePipeline(pipelineExecutionId, document, pipeline.name, placeholder.name);
    }

    private async getPlaceholderValue(placeholder: string, pipelineExecutionId: string): Promise<any | undefined> {
        return new Promise((resolve) => {
            if (placeholder === '') {
                resolve(undefined);
            }

            const placeholderValueCallback = (message: PlaceholderValueMessage) => {
                if (message.id !== pipelineExecutionId || message.data.name !== placeholder) {
                    return;
                }
                this.pythonServer.removeMessageCallback('placeholder_value', placeholderValueCallback);
                resolve(message.data.value);
            };

            this.pythonServer.addMessageCallback('placeholder_value', placeholderValueCallback);
            this.logger.info('Getting placeholder from Runner ...');
            this.pythonServer.sendMessageToPythonServer(
                createPlaceholderQueryMessage(pipelineExecutionId, placeholder),
            );

            setTimeout(() => {
                resolve(undefined);
            }, 30000);
        });
    }

    /**
     * Map that contains information about an execution keyed by the execution id.
     */
    public executionInformation: Map<string, PipelineExecutionInformation> = new Map<
        string,
        PipelineExecutionInformation
    >();

    /**
     * Get information about a pipeline execution.
     *
     * @param pipelineId Unique id that identifies a pipeline execution
     * @return Execution context assigned to the provided id.
     */
    public getExecutionContext(pipelineId: string): PipelineExecutionInformation | undefined {
        return this.executionInformation.get(pipelineId);
    }

    /**
     * Remove information from a pipeline execution, when it is no longer needed.
     *
     * @param pipelineId Unique id that identifies a pipeline execution
     */
    public dropPipelineExecutionContext(pipelineId: string) {
        this.executionInformation.delete(pipelineId);
    }

    /**
     * Remove information from all previous pipeline executions.
     */
    public dropAllPipelineExecutionContexts() {
        this.executionInformation.clear();
    }

    /**
     * Execute a Safe-DS pipeline on the python runner.
     * If a valid target placeholder is provided, the pipeline is only executed partially, to calculate the result of the placeholder.
     *
     * @param id A unique id that is used in further communication with this pipeline.
     * @param pipelineDocument Document containing the main Safe-DS pipeline to execute.
     * @param pipelineName Name of the pipeline that should be run
     * @param targetPlaceholder The name of the target placeholder, used to do partial execution. If no value or undefined is provided, the entire pipeline is run.
     */
    public async executePipeline(
        id: string,
        pipelineDocument: LangiumDocument,
        pipelineName: string,
        targetPlaceholder: string | undefined = undefined,
    ) {
        const node = pipelineDocument.parseResult.value;
        if (!isSdsModule(node)) {
            return;
        }
        // Pipeline / Module name handling
        const mainPythonModuleName = this.annotations.getPythonModule(node);
        const mainPackage = mainPythonModuleName === undefined ? node.name.split('.') : [mainPythonModuleName];
        const mainModuleName = this.getMainModuleName(pipelineDocument);
        // Code generation
        const [codeMap, lastGeneratedSources] = this.generateCodeForRunner(pipelineDocument, targetPlaceholder);
        // Store information about the run
        this.executionInformation.set(id, {
            generatedSource: lastGeneratedSources,
            sourceMappings: new Map<string, SourceMapConsumer>(),
            path: pipelineDocument.uri.fsPath,
            source: pipelineDocument.textDocument.getText(),
            calculatedPlaceholders: new Map<string, string>(),
        });
        // Code execution
        this.pythonServer.sendMessageToPythonServer(
            createProgramMessage(id, {
                code: codeMap,
                main: {
                    modulepath: mainPackage.join('.'),
                    module: mainModuleName,
                    pipeline: pipelineName,
                },
                cwd: path.parse(pipelineDocument.uri.fsPath).dir,
            }),
        );
    }

    private registerMessageLoggingCallbacks() {
        this.pythonServer.addMessageCallback('placeholder_value', (message) => {
            this.logger.trace(
                `Placeholder value is (${message.id}): ${message.data.name} of type ${message.data.type} = ${message.data.value}`,
                undefined,
            );
        });
        this.pythonServer.addMessageCallback('placeholder_type', (message) => {
            this.logger.trace(
                `Placeholder was calculated (${message.id}): ${message.data.name} of type ${message.data.type}`,
                undefined,
            );
            const execInfo = this.getExecutionContext(message.id);
            execInfo?.calculatedPlaceholders.set(message.data.name, message.data.type);
            // this.sendMessageToPythonServer(
            //    messages.createPlaceholderQueryMessage(message.id, message.data.name),
            //);
        });
        this.pythonServer.addMessageCallback('runtime_progress', (message) => {
            this.logger.trace(`Runner-Progress (${message.id}): ${message.data}`, undefined);
        });
        this.pythonServer.addMessageCallback('runtime_error', async (message) => {
            let readableStacktraceSafeDs: string[] = [];
            const execInfo = this.getExecutionContext(message.id)!;
            const readableStacktracePython = await Promise.all(
                (<RuntimeErrorMessage>message).data.backtrace.map(async (frame) => {
                    const mappedFrame = await this.tryMapToSafeDSSource(message.id, frame);
                    if (mappedFrame) {
                        readableStacktraceSafeDs.push(
                            `\tat ${URI.file(execInfo.path)}#${mappedFrame.line} (${execInfo.path} line ${
                                mappedFrame.line
                            })`,
                        );
                        return `\tat ${frame.file} line ${frame.line} (mapped to '${mappedFrame.file}' line ${mappedFrame.line})`;
                    }
                    return `\tat ${frame.file} line ${frame.line}`;
                }),
            );
            this.logger.debug(
                `[${message.id}] ${
                    (<RuntimeErrorMessage>message).data.message
                }\n${readableStacktracePython.join('\n')}`,
            );

            this.prettyPrintRuntimeError(message, readableStacktraceSafeDs);
        });
    }

    private prettyPrintRuntimeError(message: RuntimeErrorMessage, readableStacktraceSafeDs: string[]) {
        const lines = [...message.data.message.split('\n'), ...readableStacktraceSafeDs.reverse()].map((it) =>
            it.replace('\t', '    '),
        );

        this.logger.result(
            expandToStringLF`
                // ----- Runtime Error ---------------------------------------------------------
                ${joinToNode(lines, { prefix: '// ', appendNewLineIfNotEmpty: true, skipNewLineAfterLastItem: true })}
                // -----------------------------------------------------------------------------
            `,
        );
    }

    /**
     * Map a stack frame from python to Safe-DS.
     * Uses generated sourcemaps to do this.
     * If such a mapping does not exist, this function returns undefined.
     *
     * @param executionId Id that uniquely identifies the execution that produced this stack frame
     * @param frame Stack frame from the python execution
     */
    private async tryMapToSafeDSSource(
        executionId: string,
        frame: RuntimeErrorBacktraceFrame | undefined,
    ): Promise<RuntimeErrorBacktraceFrame | undefined> {
        if (!frame) {
            return undefined;
        }
        if (!this.executionInformation.has(executionId)) {
            return undefined;
        }
        const execInfo = this.executionInformation.get(executionId)!;
        let sourceMapKeys = Array.from(execInfo.generatedSource.keys() || []).filter((value) =>
            value.endsWith(`${frame.file}.py.map`),
        );
        if (sourceMapKeys.length === 0) {
            return undefined;
        }
        let sourceMapKey = sourceMapKeys[0]!;
        if (!execInfo.sourceMappings.has(sourceMapKey)) {
            const sourceMapObject = JSON.parse(execInfo.generatedSource.get(sourceMapKey)!);
            sourceMapObject.sourcesContent = [execInfo.source];
            const consumer = new SourceMapConsumer(sourceMapObject);
            execInfo.sourceMappings.set(sourceMapKey, consumer);
        }
        const outputPosition = execInfo.sourceMappings.get(sourceMapKey)!.originalPositionFor({
            line: Number(frame.line),
            column: 0,
            bias: SourceMapConsumer.LEAST_UPPER_BOUND,
        });
        return { file: outputPosition.source || '<unknown>', line: outputPosition.line || 0 };
    }

    public generateCodeForRunner(
        pipelineDocument: LangiumDocument,
        targetPlaceholder: string | undefined,
    ): [ProgramCodeMap, Map<string, string>] {
        const rootGenerationDir = path.parse(pipelineDocument.uri.fsPath).dir;
        const generatedDocuments = this.generator.generate(pipelineDocument, {
            destination: URI.file(rootGenerationDir), // actual directory of main module file
            createSourceMaps: true,
            targetPlaceholder,
            disableRunnerIntegration: false,
        });
        const lastGeneratedSources = new Map<string, string>();
        let codeMap: ProgramCodeMap = {};
        for (const generatedDocument of generatedDocuments) {
            const fsPath = URI.parse(generatedDocument.uri).fsPath;
            const workspaceRelativeFilePath = path.relative(rootGenerationDir, path.dirname(fsPath));
            const sdsFileName = path.basename(fsPath);
            const sdsNoExtFilename =
                path.extname(sdsFileName).length > 0
                    ? sdsFileName.substring(0, sdsFileName.length - path.extname(sdsFileName).length)
                    : /* c8 ignore next */
                      sdsFileName;
            // Put code in map for further use in the extension (e.g. to remap errors)
            lastGeneratedSources.set(
                path.join(workspaceRelativeFilePath, sdsFileName).replaceAll('\\', '/'),
                generatedDocument.getText(),
            );
            // Check for sourcemaps after they are already added to the pipeline context
            // This needs to happen after lastGeneratedSources.set, as errors would not get mapped otherwise
            if (fsPath.endsWith('.map')) {
                // exclude sourcemaps from sending to runner
                continue;
            }
            let modulePath = workspaceRelativeFilePath.replaceAll('/', '.').replaceAll('\\', '.');
            if (!codeMap.hasOwnProperty(modulePath)) {
                codeMap[modulePath] = {};
            }
            // Put code in object for runner
            codeMap[modulePath]![sdsNoExtFilename] = generatedDocument.getText();
        }
        return [codeMap, lastGeneratedSources];
    }

    public getMainModuleName(pipelineDocument: LangiumDocument): string {
        if (pipelineDocument.uri.fsPath.endsWith('.sds')) {
            return this.generator.sanitizeModuleNameForPython(path.basename(pipelineDocument.uri.fsPath, '.sds'));
        } else if (pipelineDocument.uri.fsPath.endsWith('.sdsdev')) {
            return this.generator.sanitizeModuleNameForPython(path.basename(pipelineDocument.uri.fsPath, '.sdsdev'));
        } else {
            return this.generator.sanitizeModuleNameForPython(path.basename(pipelineDocument.uri.fsPath));
        }
    }
}

/**
 * Context containing information about the execution of a pipeline.
 */
export interface PipelineExecutionInformation {
    source: string;
    generatedSource: Map<string, string>;
    sourceMappings: Map<string, SourceMapConsumer>;
    path: string;
    /**
     * Maps placeholder name to placeholder type
     */
    calculatedPlaceholders: Map<string, string>;
}

/* c8 ignore stop */
