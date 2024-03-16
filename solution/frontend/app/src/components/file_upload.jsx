import "../styles/file_upload.css";
import { useState } from "react";

const MAX_FILE_SIZE_BYTES = 3e6; // 3 MB

const propagateChange = (e) => document.getElementById("selectedFile").click();

// TODO: file content validation i.e. is valid csv file.
const fileUploadChange = (e, setErrorMsg, callBack) => {
	const file = e.target.files[0];
	
	if (file.type != "text/csv") {
		setErrorMsg("Invalid file type! Must be '.csv'!");
		return;
	}
	if (file.size == 0 || file.size > MAX_FILE_SIZE_BYTES) {
		setErrorMsg("File size must be not be empty and more than 3 MB!");
		return;
	}
	setErrorMsg(""); callBack(file);
	e.target.value = "";
};

export default function FileUpload(props) {
	const {hidden, callBack} = props;
	const [errorMsg, setErrorMsg] = useState("");
	
	return (
		<div hidden = {hidden}>
			<h1>Upload Data File</h1>
			<div className="container">
			  <div className="card">
				<div className="drop_box">
				  <header>
					<h4>Select File here</h4>
				  </header>
				  <p>Files Supported: CSV, Excel </p>
				  <input type="file" id="selectedFile" accept=".csv" hidden onChange = {e => fileUploadChange(e, setErrorMsg, callBack)}/>
				  <button className="btn" onClick={propagateChange}>Choose File</button>
				  <span className = "error-msg">{errorMsg}</span>
				</div>
			  </div>
			</div>
		</div>
	);
};