# Imports ----------------------------------------------------------------------

from typing import Any, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_indexed_access(receiver: Any, index: Any) -> __gen_T | None:
    return receiver[index] if receiver is not None else None

# Segments ---------------------------------------------------------------------

def test(param1, param2):
    f(param1[0])
    f(__gen_null_safe_indexed_access(param2, 0))
