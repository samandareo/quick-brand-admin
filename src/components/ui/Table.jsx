const Table = ({ headers, data, renderRow, className = "" }) => {
  return (
    <div
      className={`overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg ${className}`}
    >
      <table className="min-w-full divide-y divide-gray-300 overflow-x-auto">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.length > 0 ? (
            data.map((item, index) => <tr key={index}>{renderRow(item)}</tr>)
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
