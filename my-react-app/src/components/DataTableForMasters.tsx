export type Column<T> = {
  header: string;
  accessor: keyof T;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void; // ✅ NEW
};

export function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
}: TableProps<T>) {
  return (
    <div className="w-full max-h-[400px] overflow-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">#</th>
            {columns.map((col, i) => (
              <th key={i} className="p-3 text-left">
                {col.header}
              </th>
            ))}
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className="border-t">
              <td className="p-3">{index + 1}</td>

              {columns.map((col, i) => (
                <td key={i} className="p-3">
                  {String(row[col.accessor])}
                </td>
              ))}

              <td className="p-3 flex gap-2">
                {/* EDIT */}
                <button
                  onClick={() => onEdit?.(row)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                >
                  Edit
                </button>

                {/* DELETE ✅ */}
                <button
                  onClick={() => onDelete?.(row)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
