import { SafeDsServices } from '../safe-ds-module.js';
import { isSdsAssignment, isSdsPlaceholder, isSdsReference, SdsPlaceholder, SdsStatement } from '../generated/ast.js';
import { AstUtils, Stream } from 'langium';
import { ImpurityReason } from '../purity/model.js';
import { getAssignees } from '../helpers/nodeProperties.js';
import { SafeDsPurityComputer } from '../purity/safe-ds-purity-computer.js';

export class SafeDsSlicer {
    private readonly purityComputer: SafeDsPurityComputer;

    constructor(services: SafeDsServices) {
        this.purityComputer = services.purity.PurityComputer;
    }

    /**
     * Computes the subset of the given statements that are needed to calculate the target placeholders.
     */
    computeBackwardSliceToTargets(statements: SdsStatement[], targets: SdsStatement[]): SdsStatement[] {
        const aggregator = new BackwardSliceAggregator(this.purityComputer);

        for (const statement of statements.reverse()) {
            // Keep if it is a target
            if (targets.includes(statement)) {
                aggregator.addStatement(statement);
            }

            // Keep if it declares a referenced placeholder
            else if (
                isSdsAssignment(statement) &&
                getAssignees(statement).some((it) => isSdsPlaceholder(it) && aggregator.referencedPlaceholders.has(it))
            ) {
                aggregator.addStatement(statement);
            }

            // Keep if it has an impurity reason that affects a future impurity reason
            else if (
                this.purityComputer
                    .getImpurityReasonsForStatement(statement)
                    .some((pastReason) =>
                        aggregator.impurityReasons.some((futureReason) =>
                            pastReason.canAffectFutureImpurityReason(futureReason),
                        ),
                    )
            ) {
                aggregator.addStatement(statement);
            }
        }

        return aggregator.statements;
    }
}

class BackwardSliceAggregator {
    private readonly purityComputer: SafeDsPurityComputer;

    /**
     * The statements that are needed to calculate the target statements.
     */
    readonly statements: SdsStatement[] = [];

    /**
     * The placeholders that are needed to calculate the target statements.
     */
    readonly referencedPlaceholders: Set<SdsPlaceholder>;

    /**
     * The impurity reasons of the collected statements.
     */
    readonly impurityReasons: ImpurityReason[] = [];

    constructor(purityComputer: SafeDsPurityComputer) {
        this.purityComputer = purityComputer;

        this.referencedPlaceholders = new Set();
    }

    addStatement(statement: SdsStatement): void {
        this.statements.unshift(statement);

        // Remember all referenced placeholders
        this.getReferencedPlaceholders(statement).forEach((it) => {
            this.referencedPlaceholders.add(it);
        });

        // Remember all impurity reasons
        this.purityComputer.getImpurityReasonsForStatement(statement).forEach((it) => {
            this.impurityReasons.push(it);
        });
    }

    private getReferencedPlaceholders(node: SdsStatement): Stream<SdsPlaceholder> {
        return AstUtils.streamAllContents(node).flatMap((it) => {
            if (isSdsReference(it) && isSdsPlaceholder(it.target.ref)) {
                return [it.target.ref];
            } else {
                return [];
            }
        });
    }
}
