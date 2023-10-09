import { convertString, CstNode, DefaultValueConverter, GrammarAST, ValueType } from 'langium';

export class SafeDsValueConverter extends DefaultValueConverter {
    protected override runConverter(rule: GrammarAST.AbstractRule, input: string, cstNode: CstNode): ValueType {
        switch (rule.name.toUpperCase()) {
            case 'ID':
                return input.replaceAll('`', '');
            case 'TEMPLATE_STRING_START':
                return convertString(input.substring(0, input.length - 1));
            case 'TEMPLATE_STRING_INNER':
                return convertString(input.substring(1, input.length - 1));
            case 'TEMPLATE_STRING_END':
                return convertString(input.substring(1));
            default:
                return super.runConverter(rule, input, cstNode);
        }
    }
}
