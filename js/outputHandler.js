// outputHandler.js

let uids = [];

// 解析 XLSX 並提取 UID、账号类型、KYC狀態
function handleFileUpload(event) {
	const file = event.target.files[0];

	// 檢查檔案名稱是否包含指定關鍵字
	if (!file.name.includes('User_Investigation_Info')) {
		alert('上傳失敗：檔案名稱必須包含 "User_Investigation_Info"');
		return;
	}

	if (file) {
		const reader = new FileReader();
		reader.onload = function(e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			let sheet = workbook.Sheets[workbook.SheetNames[0]];
			let jsonData = XLSX.utils.sheet_to_json(sheet);

			if (jsonData.length > 0) {
				const headers = Object.keys(jsonData[0]);

				// 判斷文件中欄位 (英文或中文)
				if (headers.includes('Account Type') && headers.includes('Nationality')) {
					// 英文
					uids = extractData(jsonData, 'UID', 'Account Type', 'Nationality');
				} else if (headers.includes('账号类型') && headers.includes('国籍')) {
					// 中文
					uids = extractData(jsonData, 'UID', '账号类型', '国籍');
				} else {
					alert('檔案缺少必要欄位 (Account Type/账号类型, Nationality/国籍)');
					return;
				}
				displayUIDs(uids);
			}
		};
		reader.readAsArrayBuffer(file);
	}
}

// 提取 UID、账号类型、KYC
function extractData(data, uidField, accountTypeField, nationalityField) {
	let result = [];
	let uniqueUIDs = new Set();

	data.forEach(row => {
		if (row[uidField] && !uniqueUIDs.has(row[uidField])) {
			uniqueUIDs.add(row[uidField]);
			result.push({
				uid: row[uidField],
				accountType: row[accountTypeField] || '未知类型',
				kycStatus: row[nationalityField] || ''
			});
		}
	});

	return result;
}

// 顯示 UID、账号类型、KYC 狀態
function displayUIDs(dataArray) {
	const uidTableBody = document.getElementById('uidTableBody');
	uidTableBody.innerHTML = '';

	dataArray.forEach(data => {
		const row = document.createElement('tr');

		const uidCell = document.createElement('td');
		uidCell.textContent = data.uid;

		const accountTypeCell = document.createElement('td');
		accountTypeCell.textContent = data.accountType;

		const kycStatusCell = document.createElement('td');
		kycStatusCell.textContent = data.kycStatus;

		const actionCell = document.createElement('td');
		const copyButton = document.createElement('button');
		copyButton.textContent = '複製';
		copyButton.classList.add('btn', 'btn-info', 'btn-sm');
		copyButton.onclick = () => copySingleUID(data.uid);

		actionCell.appendChild(copyButton);

		row.appendChild(uidCell);
		row.appendChild(accountTypeCell);
		row.appendChild(kycStatusCell);
		row.appendChild(actionCell);
		uidTableBody.appendChild(row);
	});
}

// 複製單個 UID
function copySingleUID(uid) {
	navigator.clipboard.writeText(uid)
		.then(() => alert(`UID ${uid} 已複製到剪貼簿`))
		.catch(err => console.error('複製失敗', err));
}

// 複製所有UID
function copyAllUIDs() {
	const textToCopy = uids.map(item => item.uid).join('\n');
	navigator.clipboard.writeText(textToCopy)
		.then(() => alert('所有 UID 已複製到剪貼簿'))
		.catch(err => console.error('複製失敗', err));
}
