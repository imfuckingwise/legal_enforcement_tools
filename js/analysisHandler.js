// analysisHandler.js

let excelData = [];

// 上傳B區段檔案處理
function handleFileUploadB(event) {
	const file = event.target.files[0];

	if (!file) {
		debugError("handleFileUploadB => 未選擇任何檔案");
		return;
	}

	if (!file.name.includes('客服-执法请求跟进')) {
		alert('上傳失敗：檔案名稱必須包含 "客服-执法请求跟进"');
		debugLog("handleFileUploadB => 檔案名稱不符合:", file.name);
		return;
	}

	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			excelData = XLSX.utils.sheet_to_json(sheet);

			// 檢查必要的列是否存在
			if (excelData.length > 0) {
				const firstRow = excelData[0];
				const requiredColumns = ['申请编号', '申請編號'];
				const hasCaseNumber = requiredColumns.some(col => firstRow.hasOwnProperty(col));
				
				if (!hasCaseNumber) {
					debugLog("handleFileUploadB => 警告：未找到「申请编号」列，可用列名:", Object.keys(firstRow));
					alert('警告：未找到「申请编号」列，請檢查 Excel 文件格式');
				}
			}

			debugLog("handleFileUploadB => 解析成功, 筆數:", excelData.length);
			if (excelData.length > 0) {
				debugLog("handleFileUploadB => 第一行數據樣本:", Object.keys(excelData[0]));
			}
		} catch (ex) {
			debugError("handleFileUploadB => 解析檔案失敗:", ex);
			alert('解析檔案失敗：' + ex.message);
		}
	};
	reader.readAsArrayBuffer(file);
}

// 開始分析
function startAnalysis() {
	try {
		// 檢查是否已上傳數據
		if (!excelData || excelData.length === 0) {
			throw new Error("請先上傳 Excel 文件");
		}

		const startDateA = document.getElementById('startDateA').value;
		const endDateA   = document.getElementById('endDateA').value;
		const startDateB = document.getElementById('startDateB').value;
		const endDateB   = document.getElementById('endDateB').value;
		const triggerPercentage = parseFloat(document.getElementById('triggerPercentage').value);

		if (!startDateA || !endDateA || !startDateB || !endDateB) {
			throw new Error("請選擇 A/B 區段的開始與結束日期");
		}
		if (isNaN(triggerPercentage)) {
			throw new Error("觸發百分比必須為數字");
		}

		// 驗證日期順序
		if (new Date(startDateA) > new Date(endDateA)) {
			throw new Error("A 區段開始日期不能晚於結束日期");
		}
		if (new Date(startDateB) > new Date(endDateB)) {
			throw new Error("B 區段開始日期不能晚於結束日期");
		}

		debugLog("startAnalysis => A區段:", startDateA, "~", endDateA,
			"B區段:", startDateB, "~", endDateB, 
			"觸發百分比:", triggerPercentage,
			"總數據筆數:", excelData.length
		);

		const filteredDataA = filterDataByDate(startDateA, endDateA);
		const filteredDataB = filterDataByDate(startDateB, endDateB);

		debugLog("startAnalysis => A區段過濾後筆數:", filteredDataA.length,
			"B區段過濾後筆數:", filteredDataB.length);

		if (filteredDataA.length === 0 && filteredDataB.length === 0) {
			alert("警告：在指定日期範圍內未找到任何數據，請檢查日期範圍或 Excel 文件格式");
		}

		const countryCountA = countCountries(filteredDataA);
		const countryCountB = countCountries(filteredDataB);

		displayAnalysisResults(countryCountA, countryCountB, triggerPercentage);
	} catch (ex) {
		debugError("startAnalysis => 發生錯誤:", ex);
		alert(ex.message);
	}
}

// 根據「申请编号」中的日期過濾
function filterDataByDate(startDate, endDate) {
	try {
		const start = new Date(startDate);
		start.setHours(0, 0, 0, 0); // 設置為當天開始時間
		const end = new Date(endDate);
		end.setHours(23, 59, 59, 999); // 設置為當天結束時間

		debugLog("filterDataByDate => 開始篩選:", { start, end });

		// 嘗試多種可能的列名
		const caseNumberKeys = ['申请编号', '申請編號', '申请編號', '申請编号'];
		
		return excelData.filter((row, idx) => {
			// 尋找申請編號列
			let caseNumber = null;
			for (const key of caseNumberKeys) {
				if (row.hasOwnProperty(key) && row[key]) {
					caseNumber = String(row[key]).trim();
					break;
				}
			}

			if (!caseNumber) {
				if (idx < 5) { // 只記錄前5個無效案例，避免日誌過多
					debugLog(`Row #${idx} => 未找到申请编号列`);
				}
				return false;
			}

			// 提取日期：嘗試多種格式
			// 格式1: YYYYMMDD (前8位數字)
			// 格式2: YYYY-MM-DD
			// 格式3: YYYY/MM/DD
			let dateStr = null;
			let date = null;

			// 嘗試從前8位數字提取日期
			const dateMatch = caseNumber.match(/^(\d{4})(\d{2})(\d{2})/);
			if (dateMatch) {
				const year = dateMatch[1];
				const month = dateMatch[2];
				const day = dateMatch[3];
				dateStr = `${year}-${month}-${day}`;
				date = new Date(dateStr);
			} else {
				// 嘗試匹配標準日期格式
				const standardDateMatch = caseNumber.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
				if (standardDateMatch) {
					dateStr = `${standardDateMatch[1]}-${standardDateMatch[2]}-${standardDateMatch[3]}`;
					date = new Date(dateStr);
				}
			}

			if (!date || isNaN(date.getTime())) {
				if (idx < 5) { // 只記錄前5個解析失敗的案例
					debugLog(`Row #${idx} => 日期解析失敗, 申请编号=${caseNumber}`);
				}
				return false;
			}

			// 驗證日期是否在範圍內
			const inRange = (date >= start && date <= end);
			if (idx < 5) { // 只記錄前5個案例的詳細信息
				debugLog(`Row #${idx} => 申请编号=${caseNumber}, 日期=${dateStr}, inRange=${inRange}`);
			}
			return inRange;
		});
	} catch (ex) {
		debugError("filterDataByDate => 發生錯誤:", ex);
		return [];
	}
}

// 計算各國家
function countCountries(data) {
	try {
		let countryCounter = {};
		let skippedCount = 0;

		// 嘗試多種可能的列名
		const isCNKeys = ['司法机构-是否属于中国大陆', '司法機構-是否屬於中國大陸', '是否属于中国大陆', '是否屬於中國大陸'];
		const countryKeys = ['司法机构-所在国家', '司法機構-所在國家', '所在国家', '所在國家'];

		data.forEach((row, idx) => {
			// 尋找「是否属于中国大陆」列
			let isCN = null;
			for (const key of isCNKeys) {
				if (row.hasOwnProperty(key)) {
					isCN = row[key];
					break;
				}
			}

			// 尋找「所在国家」列
			let nat = null;
			for (const key of countryKeys) {
				if (row.hasOwnProperty(key)) {
					nat = row[key];
					break;
				}
			}

			// 標準化值（轉為字符串並去除空格）
			if (isCN !== null && isCN !== undefined) {
				isCN = String(isCN).trim();
			}
			if (nat !== null && nat !== undefined) {
				nat = String(nat).trim();
			}

			let country = null;

			// 統一處理中國的各種變體名稱
			const normalizeChinaName = (name) => {
				if (!name) return null;
				const chinaVariants = ['中国大陆', '中國大陸', '中国', '中國', 'china', 'chinese mainland'];
				const normalized = name.trim();
				// 檢查是否為中國的變體（不區分大小寫）
				for (const variant of chinaVariants) {
					if (normalized === variant || normalized.toLowerCase() === variant.toLowerCase()) {
						return '中國';
					}
				}
				return normalized;
			};

			// 判斷國家邏輯
			// 1. 如果明確標記為「中国大陆」或「是」，則為中國
			if (isCN === '中国大陆' || isCN === '中國大陸' || isCN === '是' || isCN === 'Yes' || isCN === 'YES') {
				country = '中國';
			}
			// 2. 如果標記為「否」且有國家信息，使用國家信息
			else if ((isCN === '否' || isCN === 'No' || isCN === 'NO' || isCN === '') && nat && nat.length > 0) {
				// 標準化國家名稱：去除多餘空格
				let normalizedNat = nat.replace(/\s+/g, ' ').trim();
				// 統一處理中國的各種變體
				country = normalizeChinaName(normalizedNat);
				if (!country) {
					// 如果不是中國，則轉為小寫（適用於英文國家名）
					country = normalizedNat.toLowerCase();
				}
			}
			// 3. 如果 isCN 為空但 nat 有值，也使用國家信息
			else if ((!isCN || isCN === '') && nat && nat.length > 0) {
				// 標準化國家名稱：去除多餘空格
				let normalizedNat = nat.replace(/\s+/g, ' ').trim();
				// 統一處理中國的各種變體
				country = normalizeChinaName(normalizedNat);
				if (!country) {
					// 如果不是中國，則轉為小寫（適用於英文國家名）
					country = normalizedNat.toLowerCase();
				}
			}
			// 4. 如果只有 isCN 為「否」但沒有國家信息，跳過
			else {
				skippedCount++;
				if (idx < 10) { // 只記錄前10個跳過的案例
					debugLog(`Row #${idx} => 國家資訊不足, isCN=${isCN}, nat=${nat}`);
				}
			}

			if (country) {
				countryCounter[country] = (countryCounter[country] || 0) + 1;
			}
		});

		if (skippedCount > 0) {
			debugLog(`countCountries => 跳過了 ${skippedCount} 筆國家資訊不足的記錄`);
		}
		debugLog("countCountries => 分析結果:", countryCounter);
		return countryCounter;
	} catch (ex) {
		debugError("countCountries => 發生錯誤:", ex);
		return {};
	}
}

// 顯示分析結果
function displayAnalysisResults(countA, countB, triggerPercentage) {
	const resultsBody = document.getElementById('analysisResultsBody');
	resultsBody.innerHTML = '';

	const countries = new Set([...Object.keys(countA), ...Object.keys(countB)]);
	countries.forEach(country => {
		const countAValue = countA[country] || 0;
		const countBValue = countB[country] || 0;
		let growthPercentage = 0;

		if (countAValue > 0) {
			growthPercentage = ((countBValue - countAValue) / countAValue) * 100;
		} else if (countBValue > 0) {
			growthPercentage = 100;
		}

		const row = document.createElement('tr');
		const countryCell = document.createElement('td');
		const countACell = document.createElement('td');
		const countBCell = document.createElement('td');
		const growthCell = document.createElement('td');

		countryCell.textContent = country;
		countACell.textContent = countAValue;
		countBCell.textContent = countBValue;
		growthCell.textContent = growthPercentage.toFixed(2) + '%';

		if (growthPercentage >= triggerPercentage) {
			row.style.backgroundColor = 'red';
		}

		row.appendChild(countryCell);
		row.appendChild(countACell);
		row.appendChild(countBCell);
		row.appendChild(growthCell);
		resultsBody.appendChild(row);
	});
	debugLog("displayAnalysisResults => 完成呈現");
}

function fixCountryName(country) {
	// 用字典映射將需要修改的國家名稱對應到修正名稱
	const countryMap = {
		"USA": "美國",
		"美国": "美國",
		"中国大陆": "中國",
		"中國大陸": "中國",
		"中国": "中國",
		"中國": "中國",
		"中國臺灣": "台灣",
		"dubai": "杜拜",
	};

	// 返回修正後的國家名稱，如果找不到對應則返回原名稱
	return countryMap[country] || country;
}

// 生成並複製「超過增長百分比」的報告
function generateAndCopyExceedingReport() {
	const resultsBody = document
		.getElementById('analysisResultsBody')
		.getElementsByTagName('tr');
	let reportContent = [];

	for (let row of resultsBody) {
		const country = row.cells[0].innerText;
		const aCount = parseInt(row.cells[1].innerText);
		const bCount = parseInt(row.cells[2].innerText);
		const growthPercentage = parseFloat(row.cells[3].innerText);

		// 使用 fixCountryName 修正國家名稱
		const fixedCountry = fixCountryName(country);

		if (growthPercentage > 0) {
			reportContent.push({
				country: fixedCountry, // 使用修正過的國家名稱
				aCount,
				bCount,
				growthPercentage,
				formatted: `${fixedCountry}：+${growthPercentage}% (上週${aCount}件，本週${bCount}件)`
			});
		}
	}

	// 排序並生成最終報告
	reportContent.sort((a, b) => b.growthPercentage - a.growthPercentage);
	const finalReport = reportContent.map(item => item.formatted).join('\n');

	// 複製結果到剪貼簿
	navigator.clipboard.writeText(finalReport)
		.then(() => alert('超過增長百分比的統計結果已生成並複製到剪貼簿！'))
		.catch(err => alert('複製失敗：' + err));
}


// 生成並複製「本週案件數量前N名」
function generateAndCopyTopNReport(isPDFExport = false) {
	// 取得使用者輸入的數字，若無效則預設 5
	let topN = parseInt(document.getElementById('topNInput').value);
	if (isNaN(topN) || topN <= 0) {
		topN = 5;
	}

	// 從分析結果表格中取得每個國家及其案件數（假設 B 區段案件數在第三欄）
	const resultsBody = document.getElementById('analysisResultsBody').getElementsByTagName('tr');
	let countryCount = {};

	for (let row of resultsBody) {
		let country = row.cells[0].innerText;
		const bCount = parseInt(row.cells[2].innerText);
		// 使用 fixCountryName 進行名稱修正
		country = fixCountryName(country);
		if (bCount > 0) {
			countryCount[country] = (countryCount[country] || 0) + bCount;
		}
	}

	// 將 countryCount 轉成陣列，根據案件數從大到小排序
	let sortedCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]);

	// 依據案件數量將相同數量的國家並列
	let topNRows = [];
	let currentRankValue = -1;
	let rankGroups = [];
	let outputRankCount = 0;

	// 整理報告：將案件數相同的國家列為同一排名
	for (let i = 0; i < sortedCountries.length; i++) {
		const [country, count] = sortedCountries[i];

		if (currentRankValue !== count) {
			if (rankGroups.length > 0) {
				topNRows.push([`${currentRankValue}件`, rankGroups.join('、')]); // 例: 7件: 德國、臺灣
				rankGroups = [];
				outputRankCount++;
			}
			if (outputRankCount >= topN) break;  // 超過前 N 名就停止
			currentRankValue = count;
		}
		rankGroups.push(country);
	}
	if (rankGroups.length > 0 && outputRankCount < topN) {
		topNRows.push([`${currentRankValue}件`, rankGroups.join('、')]);  // 最後一組
	}

	// 複製結果到剪貼簿（如果不是生成 PDF 時）
	if (!isPDFExport) {
		const reportText = topNRows.map(item => `${item[0]}：${item[1]}`).join('\n');
		navigator.clipboard.writeText(reportText)
			.then(() => {
				alert(`前 ${topN} 名案件數量已生成並複製到剪貼簿！`);
			})
			.catch(err => {
				alert('複製失敗：' + err);
			});
	}

	// 返回前 X 名的結果
	return topNRows;
}

function exportPDFReport() {
	try {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF({
			putOnlyUsedFonts: true,
			orientation: "p",
			unit: "mm",
			format: "a4"
		});

		// 1) 載入中文 TTF (Regular 字型)
		doc.addFileToVFS("NotoSansSC-Regular.ttf", window.CHINESE_FONT_TTF);
		doc.addFont("NotoSansSC-Regular.ttf", "NotoSansSC", "normal");
		doc.setFont("NotoSansSC", "normal");
		doc.setFontSize(20);

		// 2) 取得 UI 上 A/B 區段、topN
		const startDateA = document.getElementById('startDateA').value;
		const endDateA   = document.getElementById('endDateA').value;
		const startDateB = document.getElementById('startDateB').value;
		const endDateB   = document.getElementById('endDateB').value;
		let topN         = parseInt(document.getElementById('topNInput').value);
		if (isNaN(topN) || topN <= 0) topN = 5; // 預設 5
		const triggerPercentage = parseFloat(document.getElementById('triggerPercentage').value) || 50;

		// 3) 標題
		doc.text("司法協助報告", 105, 15, { align: "center" });

		// 4) 在標題下方再寫 A/B 區段資訊
		doc.setFontSize(12);
		let yPos = 25;
		doc.text(`A 區段: ${startDateA} ~ ${endDateA}`, 105, yPos, { align: "center" });
		yPos += 7;
		doc.text(`B 區段: ${startDateB} ~ ${endDateB}`, 105, yPos, { align: "center" });
		yPos += 10;

		// 5) 產生案件數排行前 X 名的資料 (來自 generateAndCopyTopNReport)
		const topNRows = generateAndCopyTopNReport(true);  // 傳入 true，表示是從 PDF 匯出呼叫，不複製到剪貼簿

		// 6) 先做「案件數排行前 X 名」(依照 B 區段案件數)
		//    表格標題
		doc.setFontSize(14);
		doc.text(`B 區段案件數排行前 ${topN} 名`, 105, yPos, { align: "center" });
		yPos += 6;

		// 7) 用 autoTable 畫「前 X 名」表格
		doc.autoTable({
			head: [["案件數", "國家"]],
			body: topNRows,
			startY: yPos,
			margin: { left: 20, right: 20 },
			styles: {
				font: "NotoSansSC",
				fontSize: 12
			}
		});
		// 更新 yPos (autoTable 結束後可得 finalY)
		yPos = doc.lastAutoTable.finalY + 10;

		// 8) 顯示異常數據增長觸發百分比
		doc.setFontSize(14);
		doc.text(`案件數異常增量偵測 (閾值：${triggerPercentage}%)`, 105, yPos, { align: "center" });
		yPos += 6;

		// 9) 繪製「案件數異常增量分析」表格，根據增長百分比排序
		const resultsBody = document.getElementById('analysisResultsBody').getElementsByTagName('tr');
		let reportContent = [];

		// 遍歷每一行，處理數據
		for (let row of resultsBody) {
			const country = row.cells[0].innerText;
			const aCount = parseInt(row.cells[1].innerText);
			const bCount = parseInt(row.cells[2].innerText);
			const growthPercentage = parseFloat(row.cells[3].innerText);

			// 使用 fixCountryName 修正國家名稱
			const fixedCountry = fixCountryName(country);

			// 確保顯示所有國家，增長百分比低於觸發百分比的也顯示
			reportContent.push({
				country: fixedCountry,
				aCount,
				bCount,
				growthPercentage,
				formatted: `${fixedCountry}：+${growthPercentage}% (上週${aCount}件，本週${bCount}件)`
			});
		}

		// 根據增長百分比排序（從高至低）
		reportContent.sort((a, b) => b.growthPercentage - a.growthPercentage);

		// 10) 用 autoTable 顯示增長百分比超過設定的國家報告
		doc.setFontSize(12);
		doc.autoTable({
			head: [["國家", "A 區段案件數", "B 區段案件數", "增長百分比"]],
			body: reportContent.map(item => {
				const growthPercentage = item.growthPercentage.toFixed(2);  // 只保留兩位小數
				return [item.country, `${item.aCount}`, `${item.bCount}`, `${growthPercentage}%`];
			}),
			startY: yPos,
			margin: { left: 20, right: 20 },
			styles: {
				font: "NotoSansSC",
				fontSize: 12
			},
			didParseCell: function(data) {
				// 當增長百分比 >= 觸發百分比時，將該行顯示為紅色
				if (data.section === 'body' && data.column.index === 3) {
					let rawVal = data.cell.raw;
					let numericVal = parseFloat(rawVal.replace('%', ''));
					if (!isNaN(numericVal) && numericVal >= triggerPercentage) {
						Object.values(data.row.cells).forEach(cell => {
							cell.styles.fillColor = [255, 200, 200];  // 浅红色底
						});
					} else {
						// 若增長百分比小於觸發百分比，底色設為白色
						Object.values(data.row.cells).forEach(cell => {
							cell.styles.fillColor = [255, 255, 255];  // 白色底
						});
					}
				}
			}
		});
		// 更新 yPos (autoTable 結束後可得 finalY)
		yPos = doc.lastAutoTable.finalY + 10;

		// 11) 動態檔名 (依 B 區段日期)
		doc.save(makePDFFileNameByRange(startDateB, endDateB));
	} catch (ex) {
		console.error("exportPDFReport => 產生PDF失敗:", ex);
		alert("匯出 PDF 時發生錯誤: " + ex.message);
	}
}



function makePDFFileNameByRange(startDate, endDate) {
	if (!startDate || !endDate) return "error.pdf";
	const s = startDate.replace(/-/g, "");
	const e = endDate.replace(/-/g, "");
	return `${s}_${e}_report.pdf`; 
}
