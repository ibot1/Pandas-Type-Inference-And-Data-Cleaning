import "../styles/expand_table.css";
import { useState } from "react";
import { v4 as genId } from 'uuid';


export default function ExpandTable(props) {
  const {hidden, rowData, colData} = props;
  const [state, setState] = useState({"activeEntryKey": -1, "activeRowKey": -1, "activeColKey": -1});
  const nameMap = {"p_type": "Pandas Type", "a_type": "Alias Type", "raw_data": "Original Data"};
  const FAILED_TYPE_INFERENCE = "N/A";
  
  const isSelected = (entryKey, rowKey, colKey) => state["activeEntryKey"] == entryKey && state["activeRowKey"] == rowKey && state["activeColKey"] == colKey;
  const onClick = (e, entryKey, rowKey, colKey) => {
	  if (!isSelected(entryKey, rowKey, colKey)) {
		setState({"activeEntryKey": entryKey, "activeRowKey": rowKey, "activeColKey": colKey});
		return;
	  }
	  
	  setState({"activeEntryKey": -1, "activeRowKey": -1, "activeColKey": -1});  
  };
  const getColor = (entryKey, rowKey, colKey, output) => isSelected(entryKey, rowKey, colKey) ? "blue" : output == FAILED_TYPE_INFERENCE ? "yellow" : "";
  const innerFilter = (e) => nameMap[e[0]] != undefined;
  

  // TODO: maybe header says `Processed Result`.
  return (
    <div hidden = {hidden}>
		<h1> View Type Inference And Cleaned Data </h1>
		<table className = "exp-table">
			<tbody>
				{
					<tr className = "exp-table-row" key = {genId()}   >
						{colData().entries().toArray().map(([colKey, colVal]) => 
							(<th className = "exp-table-col1" key = {genId()}   >
								{colVal}
							</th>
						))}
					</tr>
				}
				<>
					{
						rowData().entries().toArray().map(([entryKey, entryVal]) => (
							entryVal.entries().toArray().map(([rowKey, rowVal]) => (
								<>
									<tr className = "exp-table-row" key = {genId()}   >
										{rowVal.entries().toArray().map(([colKey, colVal]) => 
											(<th className = "exp-table-col2" key = {genId()} onClick={e => onClick(e, entryKey, rowKey, colKey)} bgcolor = {getColor(entryKey, rowKey, colKey, colVal["output"])}>
												{colVal["output"]}
											</th>
										))}
									</tr>
									
									{rowVal.entries().toArray().map(([colKey, colVal]) => (
										Object.entries(colVal).filter(innerFilter).map(([innerColKey, innerColVal]) => (
											<tr className = "exp-table-row" key = {genId()} hidden={!isSelected(entryKey, rowKey, colKey)}>
												<th className = "exp-table-col3" key = {genId()}>
													{nameMap[innerColKey]}
												</th>
												<th className = "exp-table-col3" key = {genId()}>
													{innerColVal}
												</th>
											</tr>
									))))}
								</>
							))
						))
					}
				</>
			</tbody>
		</table>
	</div>);
};