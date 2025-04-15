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

		if (growthPercentage > 0) {
			reportContent.push({
				country,
				aCount,
				bCount,
				growthPercentage,
				formatted: `${country}：+${growthPercentage}% (上週${aCount}件，本週${bCount}件)`
			});
		}
	}

	reportContent.sort((a, b) => b.growthPercentage - a.growthPercentage);
	const finalReport = reportContent.map(item => item.formatted).join('\n');

	navigator.clipboard.writeText(finalReport)
		.then(() => alert('超過增長百分比的統計結果已生成並複製到剪貼簿！'))
		.catch(err => alert('複製失敗：' + err));
}

// 生成並複製「本週案件數量前N名」
function generateAndCopyTopNReport() {
	// 取得使用者輸入的數字，若無效則預設 5
	let topN = parseInt(document.getElementById('topNInput').value);
	if (isNaN(topN) || topN <= 0) {
		topN = 5;
	}

	// 從分析結果表格中取得每個國家及其案件數（假設 B 區段案件數在第三欄）
	const resultsBody = document.getElementById('analysisResultsBody').getElementsByTagName('tr');
	let countryCount = {};

	for (let row of resultsBody) {
		const country = row.cells[0].innerText;
		const bCount = parseInt(row.cells[2].innerText);
		if (bCount > 0) {
			countryCount[country] = (countryCount[country] || 0) + bCount;
		}
	}

	// 將 countryCount 轉成陣列，根據案件數從大到小排序
	let sortedCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]);

	// 依據排序結果產生報告：若相同案件數則列為同一排名
	let report = '';
	let currentRankValue = -1;
	let rankGroups = [];
	let outputRankCount = 0;

	for (let i = 0; i < sortedCountries.length; i++) {
		const [country, count] = sortedCountries[i];

		if (currentRankValue !== count) {
			if (rankGroups.length > 0) {
				report += `${currentRankValue}件：${rankGroups.join('、')}\n`;
				rankGroups = [];
				outputRankCount++;
			}
			if (outputRankCount >= topN) break;
			currentRankValue = count;
		}
		rankGroups.push(country);
	}
	if (rankGroups.length > 0 && outputRankCount < topN) {
		report += `${currentRankValue}件：${rankGroups.join('、')}\n`;
	}

	// 複製結果到剪貼簿
	navigator.clipboard.writeText(report.trim())
		.then(() => {
			alert(`前 ${topN} 名案件數量已生成並複製到剪貼簿！`);
		})
		.catch(err => {
			alert('複製失敗：' + err);
		});
}

