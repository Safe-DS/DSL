import { type AstNode, type AstNodeLocator, EMPTY_STREAM, getDocument, Stream, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
import type { SafeDsCallGraphComputer } from '../flow/safe-ds-call-graph-computer.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import {
    FileRead,
    FileWrite,
    type ImpurityReason,
    OtherImpurityReason,
    PotentiallyImpureParameterCall,
} from './model.js';
import { isSdsFunction, SdsCall, SdsCallable, SdsFunction, SdsParameter } from '../generated/ast.js';
import { EvaluatedEnumVariant, ParameterSubstitutions, StringConstant } from '../partialEvaluation/model.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { SafeDsImpurityReasons } from '../builtins/safe-ds-enums.js';
import { getParameters } from '../helpers/nodeProperties.js';

export class SafeDsPurityComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly builtinImpurityReasons: SafeDsImpurityReasons;
    private readonly callGraphComputer: SafeDsCallGraphComputer;

    private readonly reasonsCache: WorkspaceCache<string, ImpurityReason[]>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.builtinAnnotations = services.builtins.Annotations;
        this.builtinImpurityReasons = services.builtins.ImpurityReasons;
        this.callGraphComputer = services.flow.CallGraphComputer;

        this.reasonsCache = new WorkspaceCache(services.shared);
    }

    /**
     * Returns whether the given call/callable is pure.
     *
     * @param node
     * The call/callable to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of the call, but the values of the parameters
     * of any containing callables, i.e. the context of the call/callable.
     */
    isPure(node: SdsCall | SdsCallable, substitutions = NO_SUBSTITUTIONS): boolean {
        return isEmpty(this.getImpurityReasons(node, substitutions));
    }

    /**
     * Returns whether the given call/callable has side effects.
     *
     * @param node
     * The call/callable to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of the call, but the values of the parameters
     * of any containing callables, i.e. the context of the call/callable.
     */
    hasSideEffects(node: SdsCall | SdsCallable, substitutions = NO_SUBSTITUTIONS): boolean {
        return this.getImpurityReasons(node, substitutions).some((it) => it.isSideEffect);
    }

    /**
     * Returns the reasons why the given call/callable is impure.
     *
     * @param node
     * The call/callable to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of the call, but the values of the parameters
     * of any containing callables, i.e. the context of the call/callable.
     */
    getImpurityReasons(node: SdsCall | SdsCallable, substitutions = NO_SUBSTITUTIONS): ImpurityReason[] {
        const key = this.getNodeId(node);
        return this.reasonsCache.get(key, () => {
            return this.callGraphComputer
                .getCallGraph(node, substitutions)
                .streamCalledCallables()
                .flatMap((it) => {
                    if (isSdsFunction(it)) {
                        return this.getImpurityReasonsForFunction(it);
                    } else {
                        return EMPTY_STREAM;
                    }
                })
                .toArray();
        });
    }

    private getImpurityReasonsForFunction(node: SdsFunction): Stream<ImpurityReason> {
        return this.builtinAnnotations.streamImpurityReasons(node).flatMap((it) => {
            switch (it.variant) {
                case this.builtinImpurityReasons.FileReadFromConstantPath:
                    return new FileRead(this.getPath(it));
                case this.builtinImpurityReasons.FileReadFromParameterizedPath:
                    return new FileRead(this.getParameter(node, it));
                case this.builtinImpurityReasons.FileWriteToConstantPath:
                    return new FileWrite(this.getPath(it));
                case this.builtinImpurityReasons.FileWriteToParameterizedPath:
                    return new FileWrite(this.getParameter(node, it));
                case this.builtinImpurityReasons.PotentiallyImpureParameterCall:
                    return new PotentiallyImpureParameterCall(this.getParameter(node, it));
                case this.builtinImpurityReasons.Other:
                    return OtherImpurityReason;
                default:
                    return EMPTY_STREAM;
            }
        });
    }

    private getPath(variant: EvaluatedEnumVariant): string | undefined {
        const path = variant.getArgumentValueByName('path');
        if (path instanceof StringConstant) {
            return path.value;
        } else {
            return undefined;
        }
    }

    private getParameter(node: SdsFunction, variant: EvaluatedEnumVariant): SdsParameter | undefined {
        const parameterName = variant.getArgumentValueByName('parameterName');
        if (!(parameterName instanceof StringConstant)) {
            return undefined;
        }

        return getParameters(node).find((it) => it.name === parameterName.value);
    }

    private getNodeId(node: AstNode) {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();
