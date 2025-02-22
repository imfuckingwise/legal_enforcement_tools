// inputHandler.js

// 添加信息
function addInfo() {
	const caseNumber = document.getElementById('caseNumber').value;
	const infoType = document.getElementById('infoType').value;
	const infoDetail = document.getElementById('infoDetail').value;
	const checkFormat = document.getElementById('checkFormat').checked;

	if (!infoDetail) {
		alert('信息内容不能为空');
		return;
	}

	// 如果勾選了「檢查格式」，則檢查地址或TXID的有效性
	if (
		checkFormat &&
		(infoType === "充值地址" || infoType === "TXID") &&
		!isValidFormat(infoType, infoDetail)
	) {
		alert(`无效的${infoType}: ${infoDetail}`);
		return;
	}

	addRow(infoType, infoDetail);
	document.getElementById('infoDetail').value = ''; // 清空输入框
}

// 根據 infoType 決定要不要檢查地址或 TXID
function isValidFormat(infoType, infoDetail) {
	if (infoType === "充值地址") {
		return (
			isValidBTCAddress(infoDetail) ||
			isValidEVMAddress(infoDetail) ||
			isValidLTCAddress(infoDetail) ||
			isValidTRONAddress(infoDetail) ||
			isValidSOLAddress(infoDetail) ||
			isValidXMRAddress(infoDetail)
		);
	}
	if (infoType === "TXID") {
		return isValidTXID(infoDetail);
	}
	return true;
}

// 添加表格行
function addRow(infoType, infoDetail) {
	const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
	const newRow = infoTable.insertRow();

	const delCell = newRow.insertCell(0);
	const infoTypeCell = newRow.insertCell(1);
	const infoDetailCell = newRow.insertCell(2);

	delCell.innerHTML = `<button class="btn btn-danger btn-sm" onclick="deleteRow(this)">刪除</button>`;
	infoTypeCell.innerText = infoType;
	infoDetailCell.innerText = infoDetail;

	// 更新資料數
	updateDataCount();
}

// 刪除單個行
function deleteRow(btn) {
	const row = btn.parentNode.parentNode;
	row.parentNode.removeChild(row);
	updateDataCount();
}

// 複製所有資料到剪貼簿
function copyAllData() {
	const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
	const rows = infoTable.rows;
	let allData = '';

	for (let i = 0; i < rows.length; i++) {
		const infoType = rows[i].cells[1].innerText;
		const infoDetail = rows[i].cells[2].innerText;
		allData += `${infoType}：${infoDetail}\n`;
	}

	if (allData) {
		navigator.clipboard.writeText(allData)
			.then(() => alert('所有資料已複製到剪貼簿！'))
			.catch(err => console.error('複製失敗', err));
	} else {
		alert('沒有可複製的資料！');
	}
}

// 刪除所有資料
function deleteAllData() {
	const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
	infoTable.innerHTML = '';
	updateDataCount();
}

// 更新資料數
function updateDataCount() {
	const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
	const rowCount = infoTable.rows.length;
	document.getElementById('dataCount').innerText = rowCount;
}

// 批量新增功能，從主視窗的輸入框中讀取
function bulkAddInfoFromMain() {
	const bulkText = document.getElementById('bulkInput').value;
	if (!bulkText) {
		alert('批量信息不能为空');
		return;
	}

	const infoList = bulkText.split("\n");

	infoList.forEach(infoDetail => {
		const detail = infoDetail.trim();
		if (!detail) return;

		const infoType = detectInfoType(detail);
		if (infoType) {
			addRow(infoType, detail);
		} else {
			alert(`无效的地址或TXID: ${detail}`);
		}
	});

	// 清空批量輸入框
	document.getElementById('bulkInput').value = '';
}

// 根據內容檢測信息類型
function detectInfoType(infoDetail) {
	if (isValidBTCAddress(infoDetail)) return "充值地址";
	if (isValidEVMAddress(infoDetail)) return "充值地址";
	if (isValidLTCAddress(infoDetail)) return "充值地址";
	if (isValidTRONAddress(infoDetail)) return "充值地址";
	if (isValidSOLAddress(infoDetail)) return "充值地址";
	if (isValidXMRAddress(infoDetail)) return "充值地址";
	if (isValidTXID(infoDetail)) return "TXID";
	return null;
}
