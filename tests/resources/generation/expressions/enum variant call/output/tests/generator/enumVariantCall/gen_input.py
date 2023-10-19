# Imports ----------------------------------------------------------------------

import safeds_runner.codegen

# Pipelines --------------------------------------------------------------------

def test():
    f(MyEnum.Variant1())
    f(safeds_runner.codegen.safe_access(MyEnum, 'Variant1')())
    f(MyEnum.Variant1())
    f(safeds_runner.codegen.safe_access(MyEnum, 'Variant1')())
    f(MyEnum.Variant2(1))
    f(safeds_runner.codegen.safe_access(MyEnum, 'Variant2')(1))
