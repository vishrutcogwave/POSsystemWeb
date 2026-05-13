// // export type Column<T> = {
// //   header: string;
// //   accessor: keyof T;
// //   cell?: (row: T) => React.ReactNode;
// // };

// // export type TableProps<T> = {
// //   columns: Column<T>[];
// //   data: T[];
// //   onEdit?: (row: T) => void;
// //   onDelete?: (row: T) => void;
// // };

// // export function DataTable<T extends { id: number }>({
// //   columns,
// //   data,
// //   onEdit,
// //   onDelete,
// // }: TableProps<T>) {
// //   // ✅ check actions exist
// //   const showActions = !!onEdit || !!onDelete;

// //   return (
// //     <div className="w-full max-h-[400px] overflow-auto bg-white rounded-xl shadow">
// //       <table className="min-w-full text-sm">
// //         <thead className="bg-gray-100 text-gray-600">
// //           <tr>
// //             <th className="p-3 text-left">#</th>

// //             {columns.map((col, i) => (
// //               <th key={i} className="p-3 text-left">
// //                 {col.header}
// //               </th>
// //             ))}

// //             {/* ✅ only show action column */}
// //             {showActions && <th className="p-3 text-left">Action</th>}
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {data.map((row, index) => (
// //             <tr key={row.id} className="border-t">
// //               <td className="p-3">{index + 1}</td>

// //               {columns.map((col, i) => (
// //                 <td key={i} className="p-3">
// //                   {col.cell ? col.cell(row) : String(row[col.accessor])}
// //                 </td>
// //               ))}

// //               {/* ✅ only show buttons if actions exist */}
// //               {showActions && (
// //                 <td className="p-3 flex gap-2">
// //                   {onEdit && (
// //                     <button
// //                       onClick={() => onEdit(row)}
// //                       className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
// //                     >
// //                       Edit
// //                     </button>
// //                   )}

// //                   {onDelete && (
// //                     <button
// //                       onClick={() => onDelete(row)}
// //                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
// //                     >
// //                       Delete
// //                     </button>
// //                   )}
// //                 </td>
// //               )}
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }


// // ✅ add this import only
// import React, { useState } from "react";

// export type Column<T> = {
//   header: string;
//   accessor: keyof T;
//   cell?: (row: T) => React.ReactNode;
// };

// export type TableProps<T> = {
//   columns: Column<T>[];
//   data: T[];
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
// };

// export function DataTable<T extends { id: number }>({
//   columns,
//   data,
//   onEdit,
//   onDelete,
// }: TableProps<T>) {
//   // ✅ check actions exist
//   const showActions = !!onEdit || !!onDelete;

//   // ✅ add only sorting states
//   const [sortKey, setSortKey] = useState<keyof T | null>(null);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

//   // ✅ add only sorting function
//   const handleSort = (key: keyof T) => {
//     if (sortKey === key) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortKey(key);
//       setSortOrder("asc");
//     }
//   };

//   // ✅ add only sorted data
//   const sortedData = [...data].sort((a, b) => {
//     if (!sortKey) return 0;

//     const aValue = a[sortKey];
//     const bValue = b[sortKey];

//     return sortOrder === "asc"
//       ? String(aValue).localeCompare(String(bValue))
//       : String(bValue).localeCompare(String(aValue));
//   });

//   return (
//     <div className="w-full max-h-[400px] overflow-auto bg-white rounded-xl shadow">
//       <table className="min-w-full text-sm">
//         <thead className="bg-gray-100 text-gray-600">
//           <tr>
//             <th className="p-3 text-left">#</th>

//             {columns.map((col, i) => (
//               <th
//                 key={i}
//                 className="p-3 text-left cursor-pointer"
//                 onClick={() => handleSort(col.accessor)}
//               >
//                 {col.header}

//                 {/* ✅ sort icon */}
//                 {sortKey === col.accessor &&
//                   (sortOrder === "asc" ? " ▲" : " ▼")}
//               </th>
//             ))}

//             {/* ✅ only show action column */}
//             {showActions && <th className="p-3 text-left">Action</th>}
//           </tr>
//         </thead>

//         <tbody>
//           {/* ✅ use sortedData only */}
//           {sortedData.map((row, index) => (
//             <tr key={row.id} className="border-t">
//               <td className="p-3">{index + 1}</td>

//               {columns.map((col, i) => (
//                 <td key={i} className="p-3">
//                   {col.cell ? col.cell(row) : String(row[col.accessor])}
//                 </td>
//               ))}

//               {/* ✅ only show buttons if actions exist */}
//               {showActions && (
//                 <td className="p-3 flex gap-2">
//                   {onEdit && (
//                     <button
//                       onClick={() => onEdit(row)}
//                       className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
//                     >
//                       Edit
//                     </button>
//                   )}

//                   {onDelete && (
//                     <button
//                       onClick={() => onDelete(row)}
//                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import React, { useState } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  cell?: (row: T) => React.ReactNode;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;

  // ✅ add this
  search?: boolean;
};

export function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
   search = true,
}: TableProps<T>) {
  const showActions = !!onEdit || !!onDelete;

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ✅ search state
  const [searchText, setSearchText] = useState("");

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // ✅ global search
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value)
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )
  );

  // ✅ sorting after filtering
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey];
    const bValue = b[sortKey];

    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="w-full bg-white rounded-xl shadow p-2">
      
      {/* ✅ show only if search=true */}
      {search && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border px-3 py-2 rounded-md w-full md:w-[40%] outline-none"
          />
        </div>
      )}

      <div className="max-h-[400px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">#</th>

              {columns.map((col, i) => (
                <th
                  key={i}
                  className="p-3 text-left cursor-pointer"
                  onClick={() => handleSort(col.accessor)}
                >
                  {col.header}

                  {sortKey === col.accessor &&
                    (sortOrder === "asc" ? " ▲" : " ▼")}
                </th>
              ))}

              {showActions && (
                <th className="p-3 text-left">Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, index) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">{index + 1}</td>

                {columns.map((col, i) => (
                  <td key={i} className="p-3">
                    {col.cell
                      ? col.cell(row)
                      : String(row[col.accessor])}
                  </td>
                ))}

                {showActions && (
                  <td className="p-3 flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Edit
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}