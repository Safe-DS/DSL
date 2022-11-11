class ColumnNameError(Exception):
    """Exception raised for trying to access an invalid column name

    Attributes:
        columnName -- Name of the column that was tried to be accessed
        message -- explanation of the error
    """

    def __init__(self, columnName):
        self.columnName = columnName
        super().__init__('Column name "{}" was not found.'.format(self.columnName))


class ColumnNameDuplicateError(Exception):
    """Exception raised for trying to modify a table, resulting in a duplicate column name

        Attributes:
            columnName -- Name of the column that resulted in a duplicate
            message -- explanation of the error
        """

    def __init__(self, columnName):
        self.columnName = columnName
        super().__init__('Column name "{}" already exists.'.format(self.columnName))
