import type { Table } from "../../../../types/shared-eda-vscode/types";

export const GetJsonTable = async function(tableName: string): Promise<Table> {
  try {
    const response = await await fetch(
      "http://127.0.0.1:" + window.pythonServerPort + "/TableAsJson?" + new URLSearchParams({ tableName }),
      {
        method: "GET",
      },
    );
    const responseText = await response.text();
    if (!response.ok) throw new Error(responseText);

    let numRows = 0;
    Object.entries(JSON.parse(responseText)).forEach((column) => {
        if (Object.values(column[1] as string).length > numRows) {
            numRows = Object.values(column[1] as string).length;
        }
    });

    let table: Table = { name: tableName, columns: [], visibleRows: 0, totalRows: numRows, appliedFilters: [] };
    let index = 0;
    for (const column of Object.entries(JSON.parse(responseText))) {
      table.columns.push([index++, {
        name: column[0],
        values: Object.values(column[1] as string),
        hidden: false,
        highlighted: false,
        type: "categorical",
        appliedSort: null,
        appliedFilters: [],
        profiling: { top: [], bottom: [] },
      }]);
    }
    return table;
  } catch (error) {
    throw new Error(`Could not get Table "${tableName}"`);
  }
}
