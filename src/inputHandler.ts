// inputHandler.ts

import {
	isValidBTCAddress,
	isValidEVMAddress,
	isValidLTCAddress,
	isValidTRONAddress,
	isValidSOLAddress,
	isValidXMRAddress,
	isValidKaspaAddress,
	isValidSuiAddress,
	isValidAptosAddress,
	isValidADAAddress,
	isValidBTCTxID,
	isValidEVMTxID,
	isValidLTCTxID,
	isValidTRONTxID,
	isValidSOLTxID,
	isValidXMRTxID,
	isValidKaspaTxID,
	isValidSuiTxID,
	isValidAptosTxID,
	isValidADATxID
} from './validations';


/**
 * 處理單筆輸入：
 * - 檢查輸入是否為空
 * - 如果信息類型為「手机号码」且勾選了「手機號碼自動加上國碼」，則自動格式化號碼
 * - 如果勾選「檢查格式」且信息類型為充值地址或 TXID，則進行格式驗證
 * - 驗證通過後呼叫 addRow() 將資料新增至表格
 */
function handleSingleInput(): void {
	const caseNumberInput = document.getElementById("caseNumber") as HTMLInputElement;
	const infoTypeSelect = document.getElementById("infoType") as HTMLSelectElement;
	const infoDetailInput = document.getElementById("infoDetail") as HTMLInputElement;
	
	if (!caseNumberInput || !infoTypeSelect || !infoDetailInput) {
		alert("無法找到必要的輸入元素");
		return;
	}

	const infoType = infoTypeSelect.value;
	let infoDetail = infoDetailInput.value.trim();
	
	if (!infoDetail) {
		alert("信息内容不能为空");
		return;
	}
	
	// 若信息類型為「手机号码」，則加上電話區碼
	if (infoType === "手机号码") {
		const phonePrefixInput = document.getElementById("phonePrefix") as HTMLInputElement;
		if (phonePrefixInput) {
			const prefix = phonePrefixInput.value.trim();
			if (prefix) {
				infoDetail = prefix + "-" + infoDetail;
			}
		}
	}
	
	addRow(infoType, infoDetail);
	infoDetailInput.value = "";
}

/**
 * 處理批量輸入：
 * - 以換行分割輸入的內容，逐行處理
 * - 移除所有空白（含行內空格）與雙引號、單引號，將結果視為單一筆資料
 */
function handleBulkInput(): void {
	const bulkInput = document.getElementById("bulkInput") as HTMLTextAreaElement;
	if (!bulkInput) {
		alert("無法找到批量輸入元素");
		return;
	}

	const bulkText = bulkInput.value;
	if (!bulkText) {
		alert("批量信息不能为空");
		return;
	}

	// 以換行拆分
	const lines = bulkText.split("\n");
	lines.forEach(function(line: string) {
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
	bulkInput.value = "";
}

/**
 * 新增一列資料到調證信息表格
 */
function addRow(infoType: string, infoDetail: string): void {
	const infoTable = document.getElementById("infoTable");
	if (!infoTable) return;

	const tbody = infoTable.getElementsByTagName("tbody")[0];
	if (!tbody) return;

	const newRow = tbody.insertRow();
	
	const cellDelete = newRow.insertCell(0);
	const cellType = newRow.insertCell(1);
	const cellDetail = newRow.insertCell(2);
	
	cellDelete.innerHTML = '<button class="btn btn-danger btn-sm" onclick="removeRow(this)">刪除</button>';
	cellType.innerText = infoType;
	cellDetail.innerText = infoDetail;
	
	updateDataCount();
}

/**
 * 刪除指定資料列
 */
function removeRow(button: HTMLButtonElement): void {
	const row = button.parentElement?.parentElement;
	if (row && row.parentElement) {
		row.parentElement.removeChild(row);
		updateDataCount();
	}
}

/**
 * 更新表格下方顯示的資料筆數
 */
function updateDataCount(): void {
	const infoTable = document.getElementById("infoTable");
	if (!infoTable) return;

	const tbody = infoTable.getElementsByTagName("tbody")[0];
	if (!tbody) return;

	const count = tbody.rows.length;
	const dataCountEl = document.getElementById("dataCount");
	if (dataCountEl) {
		dataCountEl.innerText = count.toString();
	}
}

/**
 * 根據輸入內容判斷信息類型：
 * 先檢查是否符合 TXID 格式，若符合則回傳 "TXID"；
 * 否則再檢查是否符合地址格式，若符合則回傳 "充值地址"；
 * 若都不符合，則回傳 null。
 */
function detectInfoType(infoDetail: string): string | null {
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
function copyAllData(): void {
	const infoTable = document.getElementById("infoTable");
	if (!infoTable) return;

	const tbody = infoTable.getElementsByTagName("tbody")[0];
	if (!tbody) return;

	const rows = tbody.rows;
	let allData = "";
	for (let i = 0; i < rows.length; i++) {
		const type = rows[i].cells[1].innerText;
		const detail = rows[i].cells[2].innerText;
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
function deleteAllData(): void {
	const infoTable = document.getElementById("infoTable");
	if (!infoTable) return;

	const tbody = infoTable.getElementsByTagName("tbody")[0];
	if (!tbody) return;

	tbody.innerHTML = "";
	updateDataCount();
}

// 監聽信息類型選擇，控制電話區碼輸入欄位的顯示
document.addEventListener('DOMContentLoaded', function(): void {
	console.log('DOM Content Loaded');
	const infoTypeSelect = document.getElementById("infoType") as HTMLSelectElement;
	const phonePrefixContainer = document.getElementById("phonePrefixContainer");
	
	if (!infoTypeSelect || !phonePrefixContainer) {
		console.error('Required elements not found:', {
			infoTypeSelect: !!infoTypeSelect,
			phonePrefixContainer: !!phonePrefixContainer
		});
		return;
	}

	infoTypeSelect.addEventListener("change", function(): void {
		console.log('Info type changed to:', this.value);
		if (this.value === "手机号码") {
			phonePrefixContainer.style.display = "block";
		} else {
			phonePrefixContainer.style.display = "none";
		}
	});

	// 初始化顯示狀態
	if (infoTypeSelect.value === "手机号码") {
		phonePrefixContainer.style.display = "block";
	}
});

// 將函數掛載到全域
(window as any).handleSingleInput = handleSingleInput;
(window as any).handleBulkInput = handleBulkInput;
(window as any).addRow = addRow;
(window as any).removeRow = removeRow;
(window as any).copyAllData = copyAllData;
(window as any).deleteAllData = deleteAllData;
