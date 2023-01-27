from safe_ds import exceptions
from safe_ds.data._table import Table
from sklearn import preprocessing


# noinspection PyProtectedMember
class OrdinalEncoder:
    """
    This LabelEncoder encodes one or more given columns into labels.

    Parameters
    --------
        order : list[str]
            The order in which the ordinal encoder encodes
    """

    def __init__(self, order: list[str]) -> None:
        self.is_fitted = 0
        self.oe = preprocessing.OrdinalEncoder(categories=[order])
        self.order = order

    def fit(self, table: Table, column: str) -> None:
        """
        Fit the ordinal encoder with the values in the given table.

        Parameters
        ----------
        table : Table
            The table containing the data to fit the label encoder with.

        column : str
            The list of columns which should be label encoded



        Returns
        -------
        None
            This function does not return any value. It updates the internal state of the label encoder object.

        Raises
        -------
            LearningError if the Model couldn't be fitted correctly
        """

        p_df = table._data
        p_df.columns = table.schema.get_column_names()
        try:
            self.oe.fit(p_df[[column]])
        except exceptions.NotFittedError as exc:
            raise exceptions.LearningError("") from exc

    def transform(self, table: Table, column: str) -> Table:
        """
        Transform the given Table to a ordinal encoded table.

        Parameters
         ----------
         table:
                 table with target values
         column:
                 name of column as string
         Returns
         -------
             Table with ordinal encodings.

         Raises
         ------
             a NotFittedError if the Model wasn't fitted before transforming
        """
        p_df = table._data.copy()
        p_df.columns = table.schema.get_column_names()
        try:
            p_df[[column]] = self.oe.transform(p_df[[column]])
            p_df[column] = p_df[column].astype(dtype="int64", copy=False)
            return Table(p_df)
        except Exception as exc:
            raise exceptions.NotFittedError from exc

    def fit_transform(self, table: Table, columns: list[str]) -> Table:
        """
        oridnal encodes a given Table with the given oridinal encoder
        it will take the order from the OrdinalEncoder Objekt and does not overrite the order for multiple encodings at once

        Parameters
        ----------
            table: the table which will be transformed
            columns: list of column names to be considered while encoding

        Returns
        -------
            table: a new Table object which is ordinal encoded

        Raises
        -------
            NotFittedError if the encoder wasn't fitted before transforming.

        """
        try:
            for col in columns:
                # Fit the Ordinal Encoder on the Column
                self.fit(table, col)
                # transform the column using the trained Ordinal Encoder
                table = self.transform(table, col)
            return table
        except exceptions.NotFittedError as exc:
            raise exceptions.NotFittedError from exc
