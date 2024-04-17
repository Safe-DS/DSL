# Imports ----------------------------------------------------------------------

from tests.generator.templateString import f, g

# Pipelines --------------------------------------------------------------------

def test():
    f(f'start\n{ g() }\ninner { g() }\nend')
