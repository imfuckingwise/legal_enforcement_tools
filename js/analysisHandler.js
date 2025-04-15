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

			debugLog("handleFileUploadB => 解析成功, 筆數:", excelData.length);
		} catch (ex) {
			debugError("handleFileUploadB => 解析檔案失敗:", ex);
		}
	};
	reader.readAsArrayBuffer(file);
}

// 開始分析
function startAnalysis() {
	try {
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

		debugLog("startAnalysis => A區段:", startDateA, "~", endDateA,
			"B區段:", startDateB, "~", endDateB, 
			"觸發百分比:", triggerPercentage
		);

		const filteredDataA = filterDataByDate(startDateA, endDateA);
		const filteredDataB = filterDataByDate(startDateB, endDateB);

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
		const end = new Date(endDate);

		debugLog("filterDataByDate => 開始篩選:", { start, end });

		return excelData.filter((row, idx) => {
			const caseNumber = row['申请编号'];
			if (!caseNumber || caseNumber.length < 8) {
				debugLog(`Row #${idx} => 申请编号無效:`, caseNumber);
				return false;
			}

			const year = caseNumber.substring(0, 4);
			const month = caseNumber.substring(4, 6);
			const day = caseNumber.substring(6, 8);
			const dateStr = `${year}-${month}-${day}`;
			const date = new Date(dateStr);

			if (isNaN(date)) {
				debugLog(`Row #${idx} => 日期解析失敗:`, dateStr);
				return false;
			}

			const inRange = (date >= start && date <= end);
			debugLog(`Row #${idx} => 申请编号=${caseNumber}, 日期=${dateStr}, inRange=${inRange}`);
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

		data.forEach((row, idx) => {
			const isCN = row['是否中国大陆司法机构'];
			const nat = row['司法机构-所在国家'];
			let country;

			if (isCN === '中国大陆') {
				country = '中国大陆';
			} else if (isCN === '否' && nat) {
				country = nat.trim().toLowerCase();
			}

			if (country) {
				countryCounter[country] = (countryCounter[country] || 0) + 1;
			} else {
				debugLog(`Row #${idx} => 國家資訊不足, isCN=${isCN}, nat=${nat}`);
			}
		});

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
		"中國臺灣": "台灣",
		"dubai": "杜拜",
		// 可以根據需求添加其他需要修正的國家
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
