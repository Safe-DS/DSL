# Imports ----------------------------------------------------------------------

from tests.generator.expressionLambda import f

# Pipelines --------------------------------------------------------------------

def test():
    def __gen_lambda_0(a, b=2):
        return 1
    f(__gen_lambda_0)
    def __gen_lambda_1(a, b):
        return 1
    f(__gen_lambda_1)
