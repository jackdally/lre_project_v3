  // ScrollableTable.js
  import React from 'react';
  import './ScrollableTable.css';

  const ScrollableTable = ({ data }) => {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {/* Replace with your table headers */}
              <th>Header 1</th>
              <th>Header 2</th>
              <th>Header 3</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {/* Replace with your table data */}
                <td>{row.column1}</td>
                <td>{row.column2}</td>
                <td>{row.column3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  export default ScrollableTable;
