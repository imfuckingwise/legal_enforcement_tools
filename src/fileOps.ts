// fileOps.ts

// 保存文件
function saveFile(): void {
	const caseNumberInput = document.getElementById('caseNumber') as HTMLInputElement;
	if (!caseNumberInput) {
		alert('無法找到案號輸入框');
		return;
	}

	const caseNumber = caseNumberInput.value;
	if (!caseNumber) {
		alert('请先输入案号');
		return;
	}

	const infoTable = document.getElementById('infoTable');
	if (!infoTable) {
		alert('無法找到信息表格');
		return;
	}

	const tbody = infoTable.getElementsByTagName('tbody')[0];
	if (!tbody) {
		alert('無法找到表格主體');
		return;
	}

	const rows = tbody.getElementsByTagName('tr');

	if (rows.length === 0) {
		alert('没有要保存的信息');
		return;
	}

	// 建立 Excel 工作簿
	const workbook = window.XLSX.utils.book_new();
	const worksheetData: any[][] = [];

	// 表頭
	worksheetData.push(['信息类型', '调证信息详情']);

	// 添加表格資料
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const infoType = row.cells[1].innerText;
		const infoDetail = row.cells[2].innerText;
		worksheetData.push([infoType, infoDetail]);
	}

	// 建立工作表
	const worksheet = window.XLSX.utils.aoa_to_sheet(worksheetData);
	window.XLSX.utils.book_append_sheet(workbook, worksheet, '调证信息');

	// 轉為二進制
	const wbout = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

	// 轉為Base64
	const base64Data = arrayBufferToBase64(wbout);

	// 生成下載
	const a = document.createElement('a');
	a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
	a.download = `调证信息文件${caseNumber}.xlsx`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	// 重置表單
	resetForm();

	// 顯示保存成功通知
	showSuccessAlert();
}

// 重新初始化表單
function resetForm(): void {
	const caseNumberInput = document.getElementById('caseNumber') as HTMLInputElement;
	if (caseNumberInput) {
		caseNumberInput.value = '';
	}

	const infoTable = document.getElementById('infoTable');
	if (infoTable) {
		const tbody = infoTable.getElementsByTagName('tbody')[0];
		if (tbody) {
			tbody.innerHTML = '';
		}
	}

	// 調用 updateDataCount，需要確保它已經定義
	if ((window as any).updateDataCount) {
		(window as any).updateDataCount();
	}
}

// 產生成功提示
function showSuccessAlert(): void {
	const successAlert = document.getElementById('successAlert');
	if (!successAlert) return;

	successAlert.style.display = 'block';
	successAlert.classList.add('show');
	successAlert.classList.remove('hide');
	setTimeout(() => {
		successAlert.classList.add('hide');
		successAlert.classList.remove('show');
		setTimeout(() => {
			successAlert.style.display = 'none';
		}, 500);
	}, 3000);
}

// 文件導入
function importFile(): void {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.xlsx';

	fileInput.addEventListener('change', function(event: Event): void {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();

		reader.onload = function(e: ProgressEvent<FileReader>): void {
			if (!e.target || !e.target.result) return;

			try {
				const data = new Uint8Array(e.target.result as ArrayBuffer);
				const workbook = window.XLSX.read(data, { type: 'array' });
				const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
				const rows = window.XLSX.utils.sheet_to_json(firstSheet) as any[];

				// 清空現有資料
				const infoTable = document.getElementById('infoTable');
				if (!infoTable) return;

				const tbody = infoTable.getElementsByTagName('tbody')[0];
				if (!tbody) return;

				tbody.innerHTML = '';

				// 填入表格
				rows.forEach(row => {
					const infoType = row['信息类型'];
					const infoDetail = row['调证信息详情'];
					if ((window as any).addRow) {
						(window as any).addRow(infoType, infoDetail);
					}
				});

				// 從檔案名自動填寫案號
				const caseNumber = file.name.replace(/^调证信息文件|\.xlsx$/g, '');
				const caseNumberInput = document.getElementById('caseNumber') as HTMLInputElement;
				if (caseNumberInput) {
					caseNumberInput.value = caseNumber;
				}
			} catch (ex: any) {
				console.error('導入文件失敗:', ex);
				alert('導入文件失敗: ' + (ex.message || ex));
			}
		};

		reader.readAsArrayBuffer(file);
	});

	fileInput.click();
}

// 工具函式：將二進制數據轉為 Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

// 將函數掛載到全域
(window as any).saveFile = saveFile;
(window as any).importFile = importFile;
