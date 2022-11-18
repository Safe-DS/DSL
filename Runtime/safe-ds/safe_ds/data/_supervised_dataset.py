from safe_ds.data import Table
from safe_ds.data import Column

#toDo: add documentation
class SupervisedDataset:
    def __init__(self, table: Table, y: str):
        self._y: Column = table.get_column_by_name(y)
        self._X: Table = table.drop_columns([y])

    @property
    def feature_vector(self):
        return self._X

    @property
    def targetvector(self):
        return self._y
