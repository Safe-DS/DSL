# Imports ----------------------------------------------------------------------

from typing import Any, TypeVar

# Utils ------------------------------------------------------------------------

__gen_S = TypeVar("__gen_S")

def __gen_null_safe_indexed_access(receiver: Any, index: Any) -> __gen_S | None:
    return receiver[index] if receiver is not None else None

# Segments ---------------------------------------------------------------------

def test(param1, param2):
    f(param1[0])
    f(__gen_null_safe_indexed_access(param2, 0))
