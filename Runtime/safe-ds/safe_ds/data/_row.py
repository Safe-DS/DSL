import pandas as pd


class Row:
    def __init__(self, data: pd.Series):
        self.data = data
