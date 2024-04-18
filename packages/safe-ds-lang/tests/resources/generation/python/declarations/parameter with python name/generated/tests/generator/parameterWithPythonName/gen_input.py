# Imports ----------------------------------------------------------------------

from tests.generator.parameterWithPythonName import f1, f2

# Segments ---------------------------------------------------------------------

def test(param1, param_2, param_3=0):
    f1(lambda a, b, c=0: 1)
    def __gen_lambda_0(a, b, c=0):
        pass
    f2(__gen_lambda_0)
