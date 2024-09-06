function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle("dark-mode");
}

// 添加信息
function addInfo() {
    const caseNumber = document.getElementById('caseNumber').value;
    const infoType = document.getElementById('infoType').value;
    const infoDetail = document.getElementById('infoDetail').value;

    if (!infoDetail) {
        alert('信息内容不能为空');
        return;
    }

    // 檢查是否需要驗證
    if ((infoType === "充值地址" || infoType === "TXID") && !isValidInfo(infoType, infoDetail)) {
        alert(`无效的${infoType}: ${infoDetail}`);
        return;
    }

    addRow(infoType, infoDetail);
    document.getElementById('infoDetail').value = ''; // 清空输入框
}

// 檢查地址或TXID是否有效
function isValidInfo(infoType, infoDetail) {
    if (infoType === "充值地址") {
        return isValidBTCAddress(infoDetail) || isValidEVMAddress(infoDetail) || isValidLTCAddress(infoDetail) ||
            isValidTRONAddress(infoDetail) || isValidSOLAddress(infoDetail);
    }
    if (infoType === "TXID") {
        return isValidTXID(infoDetail);
    }
    return false;
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
        navigator.clipboard.writeText(allData).then(() => {
            alert('所有資料已複製到剪貼簿！');
        }).catch(err => {
            console.error('複製失敗', err);
        });
    } else {
        alert('沒有可複製的資料！');
    }
}

// 刪除所有資料
function deleteAllData() {
    const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
    infoTable.innerHTML = ''; // 清空表格的所有資料
    updateDataCount(); // 更新資料數
}

// 刪除單個行
function deleteRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateDataCount(); // 更新資料數
}

// 更新資料數
function updateDataCount() {
    const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
    const rowCount = infoTable.rows.length;
    document.getElementById('dataCount').innerText = rowCount;
}


// 檢查各種區塊鏈地址或TXID的有效性
function isValidBTCAddress(address) {
    const p2pkhPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Pattern = /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
    return p2pkhPattern.test(address) || bech32Pattern.test(address);
}

function isValidEVMAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidLTCAddress(address) {
    const p2pkhPattern = /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/;
    const bech32Pattern = /^ltc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
    return p2pkhPattern.test(address) || bech32Pattern.test(address);
}

function isValidTRONAddress(address) {
    return /^T[a-zA-HJ-NP-Z1-9]{33}$/.test(address);
}

function isValidSOLAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// 針對不同鏈的 TXID 檢查
function isValidTXID(txid) {
    return isValidBTCTXID(txid) || isValidEVMTXID(txid) || isValidLTCTXID(txid) ||
        isValidTRONTXID(txid) || isValidSOLTXID(txid);
}

// BTC 的 TXID 格式
function isValidBTCTXID(txid) {
    // BTC 的 TXID 是64位十六進制字符
    return /^[a-fA-F0-9]{64}$/.test(txid);
}

// EVM 的 TXID 格式
function isValidEVMTXID(txid) {
    // EVM 的 TXID 是64位十六進制字符，並且必須以 0x 開頭
    return /^0x[a-fA-F0-9]{64}$/.test(txid);
}

// LTC 的 TXID 格式
function isValidLTCTXID(txid) {
    // LTC 的 TXID 是64位十六進制字符
    return /^[a-fA-F0-9]{64}$/.test(txid);
}

// TRON 的 TXID 格式 (專門針對 TRON 的檢查)
function isValidTRONTXID(txid) {
    // TRON (TRC-20) 的 TXID 是64位十六進制字符
    return /^[a-fA-F0-9]{64}$/.test(txid);
}

// Solana 的 TXID 格式
function isValidSOLTXID(txid) {
    // Solana 的 TXID 是88個字符，包含字母和數字
    return /^[A-Za-z0-9]{88}$/.test(txid);
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
        infoDetail = infoDetail.trim();
        if (!infoDetail) return;

        const infoType = detectInfoType(infoDetail);
        if (infoType) {
            addRow(infoType, infoDetail);
        } else {
            alert(`无效的地址或TXID: ${infoDetail}`);
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
    if (isValidTXID(infoDetail)) return "TXID";
    return null;
}

// 將二進制數據轉換為 Base64
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

// 將數據轉換為 Base64 字符串
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// 保存文件功能，使用 Base64 Data URL
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

    // 添加表頭
    worksheetData.push(['信息类型', '调证信息详情']);

    // 添加表格資料
    for (let row of rows) {
        const infoType = row.cells[1].innerText;
        const infoDetail = row.cells[2].innerText;
        worksheetData.push([infoType, infoDetail]);
    }

    // 建立工作表並添加到工作簿
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, '调证信息');

    // 將工作簿轉換為二進制數據
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 將數據轉換為 Base64
    const base64Data = arrayBufferToBase64(wbout);

    // 使用 Data URL 觸發下載
    const a = document.createElement('a');
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    a.download = `调证信息文件${caseNumber}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


// 文件導入功能，覆蓋現有資料，並從檔案名自動填入案號
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

            // 將資料填入表格
            rows.forEach(row => {
                const infoType = row['信息类型'];
                const infoDetail = row['调证信息详情'];
                addRow(infoType, infoDetail);
            });

            // 根據文件名自動填寫案號
            const caseNumber = file.name.replace(/^调证信息文件|\.xlsx$/g, '');
            document.getElementById('caseNumber').value = caseNumber;
        };

        reader.readAsArrayBuffer(file);
    });

    fileInput.click();
}