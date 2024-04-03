# Imports ----------------------------------------------------------------------

from tests.generator.call import f, g, h, i, j, k
from typing import Any, Callable, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_call(receiver: Any, callable: Callable[[], __gen_T]) -> __gen_T | None:
    return callable() if receiver is not None else None

# Pipelines --------------------------------------------------------------------

def test():
    f(g(1, param2=2))
    f(g(2, param2=1))
    f(h(1, param_2=2))
    f(h(2, param_2=1))
    f(h(2))
    'abc'.i()
    'abc'.j(123)
    k(456, 1.23)
    __gen_null_safe_call(f, lambda: f(g(1, param2=2)))
    __gen_null_safe_call(f, lambda: f(g(2, param2=1)))
    __gen_null_safe_call(f, lambda: f(h(1, param_2=2)))
    __gen_null_safe_call(f, lambda: f(h(2, param_2=1)))
    __gen_null_safe_call(f, lambda: f(h(2)))
    __gen_null_safe_call(i, lambda: 'abc'.i())
    __gen_null_safe_call(j, lambda: 'abc'.j(123))
    __gen_null_safe_call(k, lambda: k(456, 1.23))
