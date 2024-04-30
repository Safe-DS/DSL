# Operations

Operations are special functions that can be applied to one or two expressions. Safe-DS has a fixed set of operations that cannot be extended. We distinguish between

- prefix operations (general form `#!sds <operator> <operand>`), and
- infix operations (general form `#!sds <left operand> <operator> <right operand>`).

## Operations on Numbers

Numbers can be negated using the unary `#!sds -` operator:

- The integer negative three is `#!sds -3`.
- The float negative three is `#!sds -3.0`.

The usual arithmetic operations are also supported for integers, floats and combinations of the two. Note that when either operand is a float, the whole expression is evaluated to a float.

- Addition: `#!sds 0 + 5` (result is an integer)
- Subtraction: `#!sds 6 - 2.9` (result is a float)
- Multiplication: `#!sds 1.1 * 3` (result is a float)
- Division: `#!sds 1.0 / 4.2` (result is a float)

Finally, two numbers can be compared, which results in a boolean. The integer `#!sds 3` for example is less than the integer `#!sds 5`. Safe-DS offers operators to do such checks for order:

- Less than: `#!sds 5 < 6`
- Less than or equal: `#!sds 1 <= 3`
- Greater than or equal: `#!sds 7 >= 7`
- Greater than: `#!sds 9 > 2`

## Logical Operations

To work with logic, Safe-DS has the two boolean literals `#!sds false` and `#!sds true` as well as operations to work with them:

- (Logical) **negation** (example `#!sds not a`): Output is `#!sds true` if and only if the operand is false:

| `#!sds not a` | false | true  |
|---------|-------|-------|
| &nbsp;  | true  | false |

- **Conjunction** (example `#!sds a and b`): Output is `#!sds true` if and only if both operands are `#!sds true`. Note that the second operand is always evaluated, even if the first operand is `#!sds false` and, thus, already determines the result of the expression. The operator is not short-circuited:

| `#!sds a and b` | false | true  |
|-----------|-------|-------|
| **false** | false | false |
| **true**  | false | true  |

- **Disjunction** (example `#!sds a or b`): Output is `#!sds true` if and only if at least one operand is `#!sds true`. Note that the second operand is always evaluated, even if the first operand is `#!sds true` and, thus, already determines the result of the expression. The operator is not short-circuited:

| `#!sds a or b`  | false | true |
|-----------|-------|------|
| **false** | false | true |
| **true**  | true  | true |

## Equality Checks

There are two different types of equality in Safe-DS, _identity_ and _structural equality_. Identity checks if two objects are one and the same, whereas structural equality checks if two objects have the same structure and content. Using a real world example, two phones of the same type would be structurally equal but not identical. Both types of equality checks return a boolean literal `#!sds true` if the check was positive and `#!sds false` if the check was negative. The syntax for these operations is as follows:

- Identity: `#!sds 1 === 2`
- Structural equality: `#!sds 1 == 2`

Safe-DS also has shorthand versions for negated equality checks which should be used instead of an explicit logical negation with the `#!sds not` operator:

- Negated identity: `#!sds 1 !== 2`
- Negated structural equality: `#!sds 1 != 2`

## Elvis Operator

The elvis operator `#!sds ?:` (given its name because it resembles Elvis's haircut) is used to specify a default value that should be used instead if the left operand is `#!sds null`. This operator is not short-circuited, so both operand are always evaluated. In the following example the whole expression evaluates to `#!sds nullableExpression` if this value is not `#!sds null` and to `#!sds 42` if it is:

```sds
nullableExpression ?: 42
```
