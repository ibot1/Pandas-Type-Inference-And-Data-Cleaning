import "../styles/data_table.css";
import {useState} from "react";
import NextIcon from "../icons/next_icon";

export default function DataTable(props) {
  const {hidden, data, callBack} = props;
  const [state, setState] = useState(null);
  let tmp = {};
  
  const compute = (rowKey, colKey, colVal) => {
	if (tmp[rowKey] && tmp[rowKey][colKey]) {
		return state[rowKey][colKey];
	}
	
	tmp[rowKey] ||= {};
	return (tmp[rowKey][colKey] = colVal);
  };
  
  const onChange = (e, rowKey, colKey) => {
	  const oldState = state || tmp;
	  const newState = {...oldState, [rowKey]: {...oldState[rowKey], [colKey]: e.target.value}};
	  setState(newState);
  };
  
  const onClick = (e) => {
	  const payload = {...(state || tmp)};
	  setState(null); tmp = {};
	  callBack(payload);
  };
  
  return (
	<div hidden = {hidden}>
		<h1> Configure Type Inference And Extraction Rules </h1>
		<div className = "data-table-next-btn" onClick={onClick}> <NextIcon/> </div>
		<table className = "data-table">
			<tbody>
			{
				data().entries().toArray().map(([rowKey, rowVal]) => (		
					<tr className = "data-table-row" key = {`row-${rowKey}`}>
						{rowVal.entries().toArray().map(([colKey, colVal]) => 
							(<th className = "data-table-col" key = {`row-${rowKey}-col-${colKey}`}>
								{rowKey == 0 ? colVal: <input className = "data-table-input" type = "text" placeholder = '""' defaultValue = {compute(rowKey, colKey, colVal)} onChange={e => onChange(e, rowKey, colKey)}/>}
							</th>
						))}
					</tr>
				))
			}
			</tbody>
		</table>
	</div>
  );
};