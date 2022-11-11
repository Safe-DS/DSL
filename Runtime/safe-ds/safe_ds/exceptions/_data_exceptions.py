class ColumnNameError(Exception):
    """Exception raised for trying to access an invalid column name.

    Attributes:
        column_name -- Name of the column that was tried to be accessed
    """

    def __init__(self, column_name):
        super().__init__("Could not find column '{}'.".format(column_name))


class ColumnNameDuplicateError(Exception):
    """Exception raised for trying to modify a table, resulting in a duplicate column name.

        Attributes:
            column_name -- Name of the column that resulted in a duplicate
        """

    def __init__(self, column_name):
        super().__init__("Column '{}' already exists.".format(column_name))
