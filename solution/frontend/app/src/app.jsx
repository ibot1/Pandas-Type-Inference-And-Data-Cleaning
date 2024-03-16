import axios from "axios";
import "./styles/app.css";
import { useState } from "react";
import DataTable from "./components/data_table";
import ExpandTable from "./components/expand_table";
import FileUpload from "./components/file_upload";

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 5000 // 5 seconds
});

const makeApiRequest = (dataFile, ruleFile) => {
	const formData = new FormData();
	formData.append("data_file", dataFile);
	formData.append("rule_file", ruleFile)
	return apiClient.post("", formData, { "responseType": 'blob' }, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
};

export default function App() {
  const [state, setState] = useState({
	  "stage": 0, "data": null,
	  "ruleCols": [], "result": []
  });
  
  const dataCallBack = (file) => {
	  // TODO: for better performance use some batch reading like file.arrayBuffer since we only the columns.
	  file.text().then(data => {
		 const cols = data.split("\n")[0].replace("\r", "").split(",");
		 setState({...state, "stage": 1, "data": file, "ruleCols": cols});
	  });
  }
  
  const getRuleData = () => {
	  const cols = ["Field Name", "Pandas Type", "Alias Type", "Regex Match", "Filter", "Result Prefix", "Result Delimiter", "Result Suffix"]
	  const ruleOpt = state.ruleCols.map(col => [col, "object", "string", "^(.*)$", "", "", "", ""])
	  return [cols, ...ruleOpt];
  };
  
  const prepareRuleConfig = (ruleOpts) => {
	  const ruleConfig = {};
	  
	  Object.values(ruleOpts).forEach(ruleOpt => {
		  ruleConfig[ruleOpt[0]] = {
			  "p_type": ruleOpt[1], "a_type": ruleOpt[2],
			  "r_match": ruleOpt[3], "in": ruleOpt[4].split(",").map(e => e.trim()).filter(e => e != ''),
			  "o_prefix": ruleOpt[5], "o_delimiter": ruleOpt[6], "o_suffix": ruleOpt[7]
		  };
	  });
	  return ruleConfig;
  }
  
  const ruleCallBack = (ruleOpts) => {
	  const ruleConfig = prepareRuleConfig(ruleOpts);
	  const ruleFile = new Blob([JSON.stringify(ruleConfig)], {type: "application/json"});
	  console.log(ruleConfig);
	  makeApiRequest(state.data, ruleFile)
		.then(({data}) => {
			const link = document.getElementById("download");
			link.href = URL.createObjectURL(data); link.click();
			data.text().then(content => {
				setState({...state, "stage": 2, "result": JSON.parse(content)});
			});
	  });
  }
  
  return (
	<>
		<a id = "download" download = "result.json" hidden> </a>
		<FileUpload  hidden = {state.stage != 0} callBack = {dataCallBack}/>
		<DataTable hidden = {state.stage != 1} data = {getRuleData} callBack = {ruleCallBack}/>
		<ExpandTable hidden = {state.stage != 2} rowData = {() => state["result"]} colData = {() => state["ruleCols"]}/>
	</> 
  );
};