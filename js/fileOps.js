// fileOps.js

// 保存文件
function saveFile() {
	const caseNumber = document.getElementById('caseNumber').value;
	if (!caseNumber) {
		alert('请先输入案号');
		return;
	}

	const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
	const rows = infoTable.getElementsByTagName('tr');

	if (rows.length === 0) {
		alert('没有要保存的信息');
		return;
	}

	// 建立 Excel 工作簿
	const workbook = XLSX.utils.book_new();
	const worksheetData = [];

	// 表頭
	worksheetData.push(['信息类型', '调证信息详情']);

	// 添加表格資料
	for (let row of rows) {
		const infoType = row.cells[1].innerText;
		const infoDetail = row.cells[2].innerText;
		worksheetData.push([infoType, infoDetail]);
	}

	// 建立工作表
	const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
	XLSX.utils.book_append_sheet(workbook, worksheet, '调证信息');

	// 轉為二進制
	const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

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
function resetForm() {
	document.getElementById('caseNumber').value = '';
	const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
	infoTable.innerHTML = '';
	updateDataCount();
}

// 產生成功提示
function showSuccessAlert() {
	const successAlert = document.getElementById('successAlert');
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
function importFile() {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.xlsx';

	fileInput.addEventListener('change', function(event) {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = function(e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
			const rows = XLSX.utils.sheet_to_json(firstSheet);

			// 清空現有資料
			const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
			infoTable.innerHTML = '';

			// 填入表格
			rows.forEach(row => {
				const infoType = row['信息类型'];
				const infoDetail = row['调证信息详情'];
				addRow(infoType, infoDetail);
			});

			// 從檔案名自動填寫案號
			const caseNumber = file.name.replace(/^调证信息文件|\.xlsx$/g, '');
			document.getElementById('caseNumber').value = caseNumber;
		};

		reader.readAsArrayBuffer(file);
	});

	fileInput.click();
}

// 工具函式：將二進制數據轉為 Base64
function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}
