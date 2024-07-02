# Imports ----------------------------------------------------------------------

from tests.generator.parameterWithPythonName import f1, f2

# Segments ---------------------------------------------------------------------

def test(param1, param_2, param_3=0):
    def __gen_lambda_0(a, b, c=0):
        return 1
    f1(__gen_lambda_0)
    def __gen_lambda_1(a, b, c=0):
        pass
    f2(__gen_lambda_1)
