# Imports ----------------------------------------------------------------------

from tests.generator.enumVariantCall import f, MyEnum

# Pipelines --------------------------------------------------------------------

def test():
    f(MyEnum.Variant1())
    f(MyEnum.Variant1())
    f(MyEnum.Variant1())
    f(MyEnum.Variant1())
    f(MyEnum.Variant2(1))
    f(MyEnum.Variant2(1))
