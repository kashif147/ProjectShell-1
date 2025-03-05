// import React, { useState } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
// import { useTableColumns } from './context/TableColumnsContext ';
// import { LuRefreshCw } from "react-icons/lu";
// import {Pagination} from 'antd'


// // Custom Header Component
// const CustomHeader = (props) => {
//   const { displayName, sort, onSortChanged } = props;

//   // Handle sorting
//   const handleSort = (direction) => {
//     if (onSortChanged) {
//       onSortChanged(direction);
//     }
//   };

//   return (
//     <div className="custom-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginLeft:"10px" }}>
//       <span>{displayName}</span>
//       <span className="sort-icons">
//         <SortAscendingOutlined
//           className={`sort-icon ${sort === 'asc' ? 'active' : ''}`}
//           style={{color:"white"}}
//           onClick={() => handleSort('asc')}
//         />
//         <SortDescendingOutlined
//         style={{color:"white"}}
//           className={`sort-icon ${sort === 'desc' ? 'active' : ''}`}
//           onClick={() => handleSort('desc')}
//         />
//       </span>
//     </div>
//   );
// };

// // Styles for custom header
// const customStyles = `
//   .custom-header {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     cursor: pointer;
//   }
//   .sort-icons {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//   }
//   .sort-icon {
//     color: #aaa;
//     margin-left: 4px;
//   }
//   .sort-icon.active {
//     color: #000;
//   }
//   .ag-cell {
//     border: 1px solid #ccc; /* Border for each cell */
//   }
//   .ag-header-cell {
//     border-bottom: 2px solid #007bff; /* Bottom border for header cells */
//   }
// `;
// const GridWithDynamicColumns = () => {
//     const { columns, state, isMale, gridData, handleSort } = useTableColumns();
//   // Mock data and columns configurationwith your actual screenName logic

//   // Filter and map columns based on your logic
//   const profilColumn = columns?.Profile.filter((item) => item?.isGride)
//     ?.map((item) => ({
//       headerName: item?.titleColumn,
//       field: item?.titleColumn,
//       width: item?.width,
//       sortable: true,
//       headerComponentFramework: CustomHeader,
//       headerComponentParams: {
//         displayName: item?.titleColumn,
//         onSortChanged: (direction) => {
//           console.log(`Sorting by ${item?.field}:`, direction);
//         },
//       },
//     }));


//   return (
// //     <div>
// //        <style>{customHeaderStyle}</style>
// //       <div className="custom-grid-container ag-theme-alpine" style={{ height: 400, width: "100%" }}>
// //         <AgGridReact
// //           rowData={gridData}
// //           columnDefs={profilColumn}
          
// //           defaultColDef={{
// //             sortable: true,
// //             resizable: true,
// //             editable: true,
// //           }}
// //           cellStyle: { border: '1px solid #ccc' }
// //         />
// //       </div>
// //     </div>
// //   );

// <div>
// <style>{customStyles}</style>
// <div className="custom-grid-container ag-theme-alpine" style={{ height: 400, width: "100%" }}>
//   <AgGridReact
//     rowData={gridData}
//     columnDefs={profilColumn}
//     defaultColDef={{
//       sortable: true,
//       resizable: true,
//       editable: true,
//       cellStyle: { border: '1px solid #ccc' }, // Border for cells
//     }}
//   />
// </div>
// <div className="d-flex justify-content-between tbl-footer">
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: "100%",
//           }}
//         >
//           <span
//             style={{
//               marginRight: "4px",
//               fontSize: "12px",
//               fontWeight: "500",
//             }}
//           >
//             1-{gridData.length}
//           </span>
//           <span
//             style={{
//               marginRight: "4px",
//               fontSize: "12px",
//               fontWeight: "500",
//             }}
//           >
//             of {`${gridData.length}`}
//           </span>
//           <LuRefreshCw />
//         </div>
//         <Pagination defaultCurrent={1} total={gridData.length} pageSize={10} />
//       </div>
// </div>
// );
// };

// export default GridWithDynamicColumns;
