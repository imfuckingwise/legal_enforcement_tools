// ================================
// 全域資料結構 & 變數
// ================================

// 暫存使用者選擇的檔案 (尚未解析)
let selectedFiles = [];

// 解析後的資料，用於最後顯示在表格 (排重後)
let combinedUIDs = new Set();              // 所有 UID (排重)
let combinedTXIDs = new Set();             // 所有 TXID (排重)
let combinedAddresses = new Set();         // 所有充值地址 (排重)

// 對應分析後的最終資料，用於前端呈現
// 這裡存放物件格式: { uid: ..., type: "TXID" or "充值地址", info: ...}
let mergedResultList = [];


// ================================
// 1. 取得多檔上傳 & 顯示檔名
// ================================

/**
 * 使用者選檔時呼叫。只是將所選檔案存到 selectedFiles，
 * 並顯示在畫面上，尚未解析。
 */
function handleMultipleFiles(event) {
	const files = event.target.files;
	if (files.length === 0) {
		alert('您尚未選擇任何 XLSX 檔案');
		return;
	}

	// 將新選的檔案加到 selectedFiles (排除重複)
	for (let file of files) {
		// 若尚未加入 -> push
		if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
			selectedFiles.push(file);
		}
	}

	// 更新前端檔案列表
	displayUploadedFileList();
}

/**
 * 顯示目前已選擇的檔案列表(檔名)
 */
function displayUploadedFileList() {
	const listEl = document.getElementById('uploadedFileList');
	if (!listEl) return;

	listEl.innerHTML = '';
	selectedFiles.forEach(file => {
		const li = document.createElement('li');
		li.textContent = file.name;
		listEl.appendChild(li);
	});
}


// ================================
// 2. 按下「分析」後才做解析 + 統整 + 顯示
// ================================

/**
 * 分析所有已上傳的 XLSX 檔案
 */
function analyzeFiles() {
	if (selectedFiles.length === 0) {
		alert('尚未上傳檔案，無法分析');
		return;
	}

	// 先清空舊資料
	combinedUIDs.clear();
	combinedTXIDs.clear();
	combinedAddresses.clear();
	mergedResultList = [];

	// 依序解析全部檔案，解析完成後才進行後續動作
	// => 使用 Promise.all() 讓所有檔案讀取完再執行
	const fileReadPromises = selectedFiles.map(file => readXlsxFile(file));
	Promise.all(fileReadPromises)
		.then(() => {
			// 所有檔案都讀完了，將結果呈現在前端
			renderAnalysisResult();
		})
		.catch(err => console.error('解析 XLSX 失敗', err));
}

/**
 * 讀取單一 XLSX 檔案，解析後將資料合併到 Set
 */
function readXlsxFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = e => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: 'array' });
				const sheet = workbook.Sheets[workbook.SheetNames[0]];
				const jsonData = XLSX.utils.sheet_to_json(sheet);

				// 分析每一列
				jsonData.forEach(row => {
                    const rawUid = (
                        row['UID Matching Results'] ||
                        row['匹配UID结果'] ||
                        ''
                    ).toString().trim();
                
                    const infoType = (
                        row['Information Type'] ||
                        row['信息类型'] ||
                        ''
                    ).toString().trim();
                
                    const infoDetail = (
                        row['Investigation Information'] ||
                        row['调证信息'] ||
                        ''
                    ).toString().trim();
                
                    // 若 UID 為空或 'None'，就跳過
                    if (!rawUid || rawUid === 'None') {
                        return;
                    }
                
                    // 將 UID 存放到去重的 Set 裏
                    combinedUIDs.add(rawUid);
                
                    // infoType 判斷（中英文）
                    // 「TXID」在中英文檔案都寫法一致，所以只要判斷 == 'TXID' 即可
                    // 「用户充值地址」 等於 「User Deposit Address」
                    if (infoType === 'TXID') {
                        combinedTXIDs.add(infoDetail);
                        mergedResultList.push({
                            uid: rawUid,
                            type: 'TXID',
                            info: infoDetail
                        });
                    } else if (infoType === 'User Deposit Address' || infoType === '用户充值地址') {
                        // 若欄位寫成「用户充值地址」，也視為同一個邏輯
                        combinedAddresses.add(infoDetail);
                        mergedResultList.push({
                            uid: rawUid,
                            type: '充值地址', // 您想在前端顯示的名稱
                            info: infoDetail
                        });
                    }
                });
                   
				
				resolve(); // 完成
			} catch (ex) {
				reject(ex);
			}
		};
		reader.onerror = err => reject(err);
		reader.readAsArrayBuffer(file);
	});
}

/**
 * 將 mergedResultList 中的資料顯示在前端表格
 */
function renderAnalysisResult() {
	const tbody = document.getElementById('analysisResultBody');
	if (!tbody) return;

	tbody.innerHTML = '';
	mergedResultList.forEach(item => {
		const tr = document.createElement('tr');
		const tdUID = document.createElement('td');
		const tdType = document.createElement('td');
		const tdInfo = document.createElement('td');

		tdUID.textContent = item.uid;
		tdType.textContent = item.type;
		tdInfo.textContent = item.info;

		tr.appendChild(tdUID);
		tr.appendChild(tdType);
		tr.appendChild(tdInfo);
		tbody.appendChild(tr);
	});

	// 更新「分析結果」的總筆數
	const totalCountEl = document.getElementById('analysisTotalCount');
	if (totalCountEl) {
		totalCountEl.textContent = mergedResultList.length;
	}

	// 更新「涉案UID數(排除重複)」
	const uidCountEl = document.getElementById('uidCount');
	if (uidCountEl) {
		// 因為所有 UID 都累積在 combinedUIDs (Set) 裡
		uidCountEl.textContent = combinedUIDs.size;
	}
}




// ================================
// 3. 複製功能
// ================================

/**
 * 複製所有 UID (排除重複)
 */
function copyAllUniqueUIDs() {
	if (combinedUIDs.size === 0) {
		alert('目前沒有任何 UID');
		return;
	}
	const textToCopy = Array.from(combinedUIDs).join('\n');
	navigator.clipboard.writeText(textToCopy)
		.then(() => alert('已複製所有 UID (排除重複)！'))
		.catch(err => console.error('複製失敗', err));
}

/**
 * 複製所有 TXID 與 充值地址 (排除重複)
 */
function copyAllTxidAndAddress() {
	// 合併 & 去重
	const unionSet = new Set([...combinedTXIDs, ...combinedAddresses]);
	if (unionSet.size === 0) {
		alert('目前沒有任何 TXID 或 充值地址');
		return;
	}
	const textToCopy = Array.from(unionSet).join('\n');
	navigator.clipboard.writeText(textToCopy)
		.then(() => alert('已複製所有 TXID 與 充值地址 (排除重複)！'))
		.catch(err => console.error('複製失敗', err));
}
