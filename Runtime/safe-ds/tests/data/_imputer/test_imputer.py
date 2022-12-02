import pytest
from sklearn.impute import SimpleImputer
import numpy as np
from safe_ds.data import Table, Imputer
import pandas as pd



def test_imputer():
    X_table = Table(pd.DataFrame(data={"col1": [np.nan, 2, 3, 4, 5]}))
    column = X_table.get_column_by_name("col1")
    imp = Imputer(Imputer.Strategy.Mean())
    new_table = imp.fit_transform(X_table)


    assert new_table.get_column_by_name("col1")._data[0] == column.statistics.mean()
