// inputHandler.js

/**
 * 處理單筆輸入：
 * 1. 檢查輸入是否為空
 * 2. 若勾選檢查格式，則依 infoType 使用 isValidInfo() 驗證
 * 3. 驗證通過後呼叫 addRow() 新增至表格
 */
function handleSingleInput() {
	var caseNumber = document.getElementById("caseNumber").value;
	var infoType = document.getElementById("infoType").value;
	var infoDetail = document.getElementById("infoDetail").value.trim();
	var checkFormat = document.getElementById("checkFormat").checked;
	
	if (!infoDetail) {
		alert("信息内容不能为空");
		return;
	}
	
	if (checkFormat && (infoType === "充值地址" || infoType === "TXID")) {
		if (!isValidInfo(infoType, infoDetail)) {
			alert("无效的" + infoType + ": " + infoDetail);
			return;
		}
	}
	
	addRow(infoType, infoDetail);
	document.getElementById("infoDetail").value = "";
}

/**
 * 處理批量輸入：
 * 1. 按行分割輸入
 * 2. 針對每行呼叫 detectInfoType() 判斷類型，若有效則新增
 */
function handleBulkInput() {
	var bulkText = document.getElementById("bulkInput").value;
	if (!bulkText) {
		alert("批量信息不能为空");
		return;
	}
	
	var lines = bulkText.split("\n");
	lines.forEach(function(line) {
		var detail = line.trim();
		if (!detail) return;
		var infoType = detectInfoType(detail);
		if (infoType) {
			addRow(infoType, detail);
		} else {
			alert("无效的地址或TXID: " + detail);
		}
	});
	document.getElementById("bulkInput").value = "";
}

/**
 * 新增一列資料到調證信息表格
 */
function addRow(infoType, infoDetail) {
	var tbody = document.getElementById("infoTable").getElementsByTagName("tbody")[0];
	var newRow = tbody.insertRow();
	
	var cellDelete = newRow.insertCell(0);
	var cellType = newRow.insertCell(1);
	var cellDetail = newRow.insertCell(2);
	
	cellDelete.innerHTML = '<button class="btn btn-danger btn-sm" onclick="removeRow(this)">刪除</button>';
	cellType.innerText = infoType;
	cellDetail.innerText = infoDetail;
	
	updateDataCount();
}

/**
 * 刪除指定資料列
 */
function removeRow(button) {
	var row = button.parentNode.parentNode;
	row.parentNode.removeChild(row);
	updateDataCount();
}

/**
 * 更新表格下方顯示的資料筆數
 */
function updateDataCount() {
	var tbody = document.getElementById("infoTable").getElementsByTagName("tbody")[0];
	var count = tbody.rows.length;
	document.getElementById("dataCount").innerText = count;
}

/**
 * 根據輸入內容判斷信息類型：
 * 若符合 BTC、Kaspa、Sui、Aptos 地址格式，視為 "充值地址"；
 * 若符合 TXID 格式，視為 "TXID"。
 */
function detectInfoType(infoDetail) {
	if (isValidBTCAddress(infoDetail)) return "充值地址";
	if (isValidKaspaAddress(infoDetail) || isValidSuiAddress(infoDetail) || isValidAptosAddress(infoDetail))
		return "充值地址";
	if (isValidKaspaTxID(infoDetail) || isValidSuiTxID(infoDetail) || isValidAptosTxID(infoDetail))
		return "TXID";
	return null;
}

/**
 * 複製所有已輸入資料到剪貼簿（依行以換行分隔）
 */
function copyAllData() {
	var tbody = document.getElementById("infoTable").getElementsByTagName("tbody")[0];
	var rows = tbody.rows;
	var allData = "";
	for (var i = 0; i < rows.length; i++) {
		var type = rows[i].cells[1].innerText;
		var detail = rows[i].cells[2].innerText;
		allData += type + "：" + detail + "\n";
	}
	if (allData) {
		navigator.clipboard.writeText(allData)
			.then(function() {
				alert("所有資料已複製到剪貼簿！");
			})
			.catch(function(err) {
				console.error("複製失敗", err);
			});
	} else {
		alert("沒有可複製的資料！");
	}
}

/**
 * 刪除所有資料列
 */
function deleteAllData() {
	var tbody = document.getElementById("infoTable").getElementsByTagName("tbody")[0];
	tbody.innerHTML = "";
	updateDataCount();
}
