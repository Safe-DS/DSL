import os.path
from pathlib import Path

import pandas as pd


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    def to_json(self, path_to_file: str):
        """
        Write the data from the table into a json file.
        :param path_to_file: The path as String to the output file. If the file does not exist it will be created.
        If the file does already exist it will be overwritten.
        """
        Path(os.path.dirname(path_to_file)).mkdir(parents=True, exist_ok=True)
        self.data.to_json(path_to_file)

    def to_csv(self, path_to_file: str):
        """
        Write the data from the table into a csv file.
        :param path_to_file: The path as String to the output file. If the file does not exist it will be created.
        If the file does already exist it will be overwritten.
        """
        Path(os.path.dirname(path_to_file)).mkdir(parents=True, exist_ok=True)
        self.data.to_csv(path_to_file)
