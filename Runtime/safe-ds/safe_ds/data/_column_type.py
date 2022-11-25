from __future__ import annotations
import numpy as np


class ColumnType:
    def __init__(self):
        pass

    def is_numeric(self) -> bool:
        """
        tells if the given column type is numeric
        Returns
        -------
        bool
        """
        return False

    def __repr__(self):
        pass

    def __eq__(self, other: ColumnType):
        return isinstance(self, type(other))

    @staticmethod
    def from_numpy_dtype(_type: np.dtype) -> ColumnType:
        """
        return the column type for a given numpy dtype
        Parameters
        ----------
        _type : numpy.dtype

        Returns
        -------
        ColumnType

        """
        if _type.kind == 'u' or _type.kind == 'i':
            return IntColumnType()
        if _type.kind == 'b':
            return BooleanColumnType()
        if _type.kind == 'f':
            return FloatColumnType()
        if _type.kind == 'S' or _type == 'U' or _type.kind == 'O':
            return StringColumnType()
        else:
            raise TypeError("Unexpected column type")


class IntColumnType(ColumnType):
    def __init__(self):
        super().__init__()

    def is_numeric(self) -> bool:
        return True

    def __repr__(self):
        return "int"


class BooleanColumnType(ColumnType):
    def __init__(self):
        super().__init__()

    def is_numeric(self) -> bool:
        return False

    def __repr__(self):
        return "bool"


class FloatColumnType(ColumnType):
    def __init__(self):
        super().__init__()

    def is_numeric(self) -> bool:
        return True

    def __repr__(self):
        return "float"


class StringColumnType(ColumnType):
    def __init__(self):
        super().__init__()

    def is_numeric(self) -> bool:
        return False

    def __repr__(self):
        return "string"


class OptionalColumnType(ColumnType):
    def __init__(self, _type: ColumnType):
        super().__init__()
        self._type = _type

    def is_numeric(self) -> bool:
        return self._type.is_numeric()

    def __repr__(self):
        return f"optional({self._type.__repr__()})"
