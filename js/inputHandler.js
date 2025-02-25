// inputHandler.js

/**
 * 使用 libphonenumber-js 解析以 "+" 開頭的國際號碼，
 * 僅在「國碼」與「本地號碼」之間放一個 dash，格式為：<國碼>-<本地號碼>。
 *
 * 若號碼不是以 "+" 開頭，則採用簡單啟發式處理：
 * 1. 移除所有空格、括號、連字號。
 * 2. 若以 "0" 開頭且長度為 10，假設為台灣手機：回傳 "886-後9碼"。
 * 3. 若長度大於 10，假設前面部分為國碼：國碼長度 = 總長度 - 10。
 * 4. 其他情況下直接回傳清理後的數字。
 */
function formatPhoneNumberAuto(phoneStr) {
	// 移除空格、括號、連字號
	let cleaned = phoneStr.replace(/[\s\-\(\)]/g, "");

	// 如果以 "+" 開頭，嘗試用 libphonenumber-js 解析
	if (cleaned.startsWith("+")) {
		try {
			const phoneNumber = libphonenumber.parsePhoneNumberFromString(cleaned);
			if (phoneNumber) {
				return phoneNumber.countryCallingCode + "-" + phoneNumber.nationalNumber;
			}
		} catch (e) {
			console.error("解析國際號碼錯誤:", e);
		}
		// 若解析失敗，移除 "+" 後繼續下方啟發式
		cleaned = cleaned.substring(1);
	}

	// 啟發式處理：沒有 "+" 的情況
	// 若以 "0" 開頭且長度為 10，假設為台灣手機
	if (cleaned.startsWith("0") && cleaned.length === 10) {
		return "886-" + cleaned.substring(1);
	}

	// 若長度 > 10，假設前面部分為國碼
	if (cleaned.length > 10) {
		let countryCodeLength = cleaned.length - 10;
		return cleaned.substring(0, countryCodeLength) + "-" + cleaned.substring(countryCodeLength);
	}

	// 其他情況，直接回傳清理後的數字
	return cleaned;
}

/**
 * 處理單筆輸入：
 * - 檢查輸入是否為空
 * - 如果信息類型為「手机号码」且勾選了「手機號碼自動加上國碼」，則自動格式化號碼
 * - 如果勾選「檢查格式」且信息類型為充值地址或 TXID，則進行格式驗證
 * - 驗證通過後呼叫 addRow() 將資料新增至表格
 */
function handleSingleInput() {
	var caseNumber = document.getElementById("caseNumber").value;
	var infoType = document.getElementById("infoType").value;
	var infoDetail = document.getElementById("infoDetail").value.trim();
	// 取得 "手機號碼自動加上國碼" 勾選狀態
	var autoPhoneFormat = document.getElementById("autoPhoneFormat") ? document.getElementById("autoPhoneFormat").checked : false;
	
	if (!infoDetail) {
		alert("信息内容不能为空");
		return;
	}
	
	// 若信息類型為「手机号码」且勾選自動加國碼，則格式化號碼
	if (infoType === "手机号码" && autoPhoneFormat) {
		infoDetail = formatPhoneNumberAuto(infoDetail);
	}
	
	addRow(infoType, infoDetail);
	document.getElementById("infoDetail").value = "";
}

/**
 * 處理批量輸入：
 * - 以換行分割輸入的內容，逐行處理
 * - 移除所有空白（含行內空格）與雙引號、單引號，將結果視為單一筆資料
 */
function handleBulkInput() {
	const bulkText = document.getElementById("bulkInput").value;
	if (!bulkText) {
		alert("批量信息不能为空");
		return;
	}

	// 以換行拆分
	const lines = bulkText.split("\n");
	lines.forEach(function(line) {
		// 移除所有引號與空白字元
		// [\s] 代表所有空白字元（含空格、tab、換行等）
		// ["'] 代表雙引號和單引號
		// 整合後使用全域修飾 /g
		let detail = line.replace(/["'\s]/g, "");

		// 若處理後的字串為空，則跳過
		if (!detail) return;

		// 檢測資料類型
		const infoType = detectInfoType(detail);
		if (infoType) {
			addRow(infoType, detail);
		} else {
			alert("无效的地址或TXID: " + detail);
		}
	});

	// 清空批量輸入框!
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
 * 若符合 地址格式，視為 "充值地址"；
 * 若符合 TXID 格式，視為 "TXID"。
 */
/**
 * 根據輸入內容判斷信息類型：
 * 先檢查是否符合 TXID 格式，若符合則回傳 "TXID"；
 * 否則再檢查是否符合地址格式，若符合則回傳 "充值地址"；
 * 若都不符合，則回傳 null。
 */
function detectInfoType(infoDetail) {
	// 先檢查 TXID 格式
	if (
		isValidBTCTxID(infoDetail) ||
		isValidEVMTxID(infoDetail) ||
		isValidLTCTxID(infoDetail) ||
		isValidTRONTxID(infoDetail) ||
		isValidSOLTxID(infoDetail) ||
		isValidXMRTxID(infoDetail) ||
		isValidKaspaTxID(infoDetail) ||
		isValidSuiTxID(infoDetail) ||
		isValidAptosTxID(infoDetail) ||
		isValidADATxID(infoDetail)
	) {
		return "TXID";
	}
	// 再檢查地址格式
	if (
		isValidBTCAddress(infoDetail) ||
		isValidEVMAddress(infoDetail) ||
		isValidLTCAddress(infoDetail) ||
		isValidTRONAddress(infoDetail) ||
		isValidSOLAddress(infoDetail) ||
		isValidXMRAddress(infoDetail) ||
		isValidKaspaAddress(infoDetail) ||
		isValidSuiAddress(infoDetail) ||
		isValidAptosAddress(infoDetail) ||
		isValidADAAddress(infoDetail)
	) {
		return "充值地址";
	}
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
