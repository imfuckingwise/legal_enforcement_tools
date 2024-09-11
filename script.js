// 顯示不同的功能區
function showSection(sectionId) {
    const sections = ['inputSection', 'outputSection', 'analysisSection'];
    sections.forEach(id => {
        document.getElementById(id).classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
}


// 切換深色模式
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // 更新深色模式按鈕的文字
    const toggleButton = document.getElementById('toggleDarkMode');
    if (body.classList.contains('dark-mode')) {
        toggleButton.innerText = '切換淺色模式';
    } else {
        toggleButton.innerText = '切換深色模式';
    }
}

// 初始化時自動偵測系統主題
window.onload = function() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (prefersDarkScheme.matches) {
        document.body.classList.add("dark-mode");
        document.getElementById('toggleDarkMode').innerText = '切換淺色模式';
    } else {
        document.body.classList.remove("dark-mode");
        document.getElementById('toggleDarkMode').innerText = '切換深色模式';
    }
};


// 添加信息
function addInfo() {
    const caseNumber = document.getElementById('caseNumber').value;
    const infoType = document.getElementById('infoType').value;
    const infoDetail = document.getElementById('infoDetail').value;
    const checkFormat = document.getElementById('checkFormat').checked; // 檢查是否勾選檢查格式

    if (!infoDetail) {
        alert('信息内容不能为空');
        return;
    }

    // 如果勾選了「檢查格式」，則檢查地址或TXID的有效性
    if (checkFormat && (infoType === "充值地址" || infoType === "TXID") && !isValidInfo(infoType, infoDetail)) {
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

// 保存文件功能，使用 Base64 Data URL，並在保存後自動清空文件名和資料
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

    // 保存文件後自動重整：清空文件名和表格資料
    resetForm();

    // 顯示成功通知
    showSuccessAlert();
}

// 顯示保存成功的通知
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
    }, 3000);  // 3秒後隱藏
}

// 重置表單和表格資料
function resetForm() {
    document.getElementById('caseNumber').value = '';  // 清空文件名
    const infoTable = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
    infoTable.innerHTML = '';  // 清空表格資料
    updateDataCount();  // 更新資料數
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

/////////////////////
//// 調證結果輸出 ////
/////////////////////

// 用於儲存 UID 和 账号类型 的全局變數
let uids = [];
let accountTypes = [];

// 解析 XLSX 文件並提取 UID、账号类型 和 Nationality/国籍
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    // 檢查檔案名稱是否包含 "User_Investigation_Info"
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

            // 判斷是英文還是中文，並提取 UID、账号类型 和 Nationality/国籍
            if (jsonData.length > 0) {
                const headers = Object.keys(jsonData[0]);

                if (headers.includes('Account Type') && headers.includes('Nationality')) {
                    // 英文檔案
                    uids = extractData(jsonData, 'UID', 'Account Type', 'Nationality');
                } else if (headers.includes('账号类型') && headers.includes('国籍')) {
                    // 中文檔案
                    uids = extractData(jsonData, 'UID', '账号类型', '国籍');
                } else {
                    alert('檔案缺少必要欄位 (Account Type/账号类型, Nationality/国籍)');
                    return;
                }

                // 顯示 UID、账号类型 和 Nationality/国籍
                displayUIDs(uids);
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

// 提取 UID、账号类型 和 Nationality/国籍
function extractData(data, uidField, accountTypeField, nationalityField) {
    let result = [];
    let uniqueUIDs = new Set();
    
    data.forEach(row => {
        if (row[uidField] && !uniqueUIDs.has(row[uidField])) {
            uniqueUIDs.add(row[uidField]);
            result.push({
                uid: row[uidField],
                accountType: row[accountTypeField] || '未知类型',
                kycStatus: row[nationalityField] || ''  // 若無 KYC，顯示空白
            });
        }
    });
    
    return result;
}

// 在頁面上顯示 UID、账号类型 和 KYC 狀態，並添加複製按鈕
function displayUIDs(dataArray) {
    const uidTableBody = document.getElementById('uidTableBody');
    uidTableBody.innerHTML = '';  // 清空表格

    dataArray.forEach(data => {
        const row = document.createElement('tr');

        const uidCell = document.createElement('td');
        uidCell.textContent = data.uid;

        const accountTypeCell = document.createElement('td');
        accountTypeCell.textContent = data.accountType;

        const kycStatusCell = document.createElement('td');
        kycStatusCell.textContent = data.kycStatus;  // 有 KYC 顯示內容，無 KYC 顯示空白

        const actionCell = document.createElement('td');
        const copyButton = document.createElement('button');
        copyButton.textContent = '複製';
        copyButton.classList.add('btn', 'btn-info', 'btn-sm');
        copyButton.onclick = function() {
            copySingleUID(data.uid);
        };
        actionCell.appendChild(copyButton);

        row.appendChild(uidCell);
        row.appendChild(accountTypeCell);
        row.appendChild(kycStatusCell);
        row.appendChild(actionCell); // 添加操作按鈕列
        uidTableBody.appendChild(row);
    });
}

// 複製單個 UID 到剪貼簿
function copySingleUID(uid) {
    navigator.clipboard.writeText(uid).then(() => {
        alert(`UID ${uid} 已複製到剪貼簿`);
    }).catch(err => {
        console.error('複製失敗', err);
    });
}

// 保留複製所有 UID 的功能
function copyAllUIDs() {
    const textToCopy = uids.map(item => item.uid).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('所有 UID 已複製到剪貼簿');
    }).catch(err => {
        console.error('複製失敗', err);
    });
}

/////////////////////
////// 數據分析 //////
/////////////////////

let excelData = [];

// 文件上傳處理
function handleFileUploadB(event) {
    const file = event.target.files[0];

    // 檢查檔案名稱是否包含 "User_Investigation_Info"
    if (!file.name.includes('客服-执法请求跟进')) {
        alert('上傳失敗：檔案名稱必須包含 "客服-执法请求跟进"');
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            let sheet = workbook.Sheets[workbook.SheetNames[0]];
            excelData = XLSX.utils.sheet_to_json(sheet);
        };
        reader.readAsArrayBuffer(file);
    }
}

// 開始分析數據
function startAnalysis() {
    const startDateA = document.getElementById('startDateA').value;
    const endDateA = document.getElementById('endDateA').value;
    const startDateB = document.getElementById('startDateB').value;
    const endDateB = document.getElementById('endDateB').value;
    const triggerPercentage = parseFloat(document.getElementById('triggerPercentage').value);

    if (!startDateA || !endDateA || !startDateB || !endDateB) {
        alert("請選擇兩個時間區段");
        return;
    }

    const filteredDataA = filterDataByDate(startDateA, endDateA);
    const filteredDataB = filterDataByDate(startDateB, endDateB);

    console.log("篩選出的 A 時間區段數據：", filteredDataA);
    console.log("篩選出的 B 時間區段數據：", filteredDataB);

    const countryCountA = countCountries(filteredDataA);
    const countryCountB = countCountries(filteredDataB);

    displayAnalysisResults(countryCountA, countryCountB, triggerPercentage);
}

// 過濾數據根據「申请编号」中的日期
function filterDataByDate(startDate, endDate) {
    // 將選擇的日期轉換為 Date 物件進行比較
    const start = new Date(startDate);
    const end = new Date(endDate);

    return excelData.filter(row => {
        const caseNumber = row['申请编号'];

        // 確保「申请编号」欄位存在且長度足夠
        if (caseNumber && caseNumber.length >= 8) {
            const year = caseNumber.substring(0, 4); // 前4個字元代表年
            const month = caseNumber.substring(4, 6); // 中間2個字元代表月
            const day = caseNumber.substring(6, 8); // 後2個字元代表日

            // 創建新的日期物件
            const date = new Date(`${year}-${month}-${day}`);

            // 比較日期區間
            if (!isNaN(date)) {
                return date >= start && date <= end;
            } else {
                console.log(`無效日期: 申请编号 ${caseNumber}`);
            }
        } else {
            console.log(`无效申请编号: ${caseNumber}`);
        }

        return false; // 如果日期無效，則排除
    });
}


// 計算每個國家出現的次數
function countCountries(data) {
    let countryCounter = {};

    data.forEach(row => {
        let country;

        // 根據「是否中国大陆司法机构」來判斷國家
        if (row['是否中国大陆司法机构'] === '中国大陆') {
            country = '中国大陆';
        } else if (row['是否中国大陆司法机构'] === '否' && row['司法机构-所在国家']) {
            country = row['司法机构-所在国家'].trim().toLowerCase();
        }

        if (country) {
            if (countryCounter[country]) {
                countryCounter[country]++;
            } else {
                countryCounter[country] = 1;
            }
        }
    });

    return countryCounter;
}

// 顯示分析結果
function displayAnalysisResults(countA, countB, triggerPercentage) {
    const resultsBody = document.getElementById('analysisResultsBody');
    resultsBody.innerHTML = ''; // 清空現有結果

    const countries = new Set([...Object.keys(countA), ...Object.keys(countB)]);

    countries.forEach(country => {
        const countAValue = countA[country] || 0;
        const countBValue = countB[country] || 0;
        let growthPercentage = 0;

        if (countAValue > 0) {
            growthPercentage = ((countBValue - countAValue) / countAValue) * 100;
        } else if (countBValue > 0) {
            growthPercentage = 100; // A區段為0且B區段有數據
        }

        const row = document.createElement('tr');

        const countryCell = document.createElement('td');
        countryCell.textContent = country;

        const countACell = document.createElement('td');
        countACell.textContent = countAValue;

        const countBCell = document.createElement('td');
        countBCell.textContent = countBValue;

        const growthCell = document.createElement('td');
        growthCell.textContent = growthPercentage.toFixed(2) + '%';

        if (growthPercentage >= triggerPercentage) {
            row.setAttribute('style', 'background-color: red !important;');
        }        

        row.appendChild(countryCell);
        row.appendChild(countACell);
        row.appendChild(countBCell);
        row.appendChild(growthCell);

        resultsBody.appendChild(row);
    });
}