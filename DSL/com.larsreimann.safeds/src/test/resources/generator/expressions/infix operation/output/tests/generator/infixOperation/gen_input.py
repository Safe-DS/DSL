# Imports ----------------------------------------------------------------------

import simpleml.codegen

# Workflows --------------------------------------------------------------------

def test():
    f(simpleml.codegen.eager_or(g(), g()))
    f(simpleml.codegen.eager_and(g(), g()))
    f((h()) == (h()))
    f((h()) != (h()))
    f((h()) is (h()))
    f((h()) is not (h()))
    f((h()) < (h()))
    f((h()) <= (h()))
    f((h()) >= (h()))
    f((h()) > (h()))
    f((h()) + (h()))
    f((h()) - (h()))
    f((h()) * (h()))
    f((h()) / (h()))
    f(simpleml.codegen.eager_elvis(i(), i()))
