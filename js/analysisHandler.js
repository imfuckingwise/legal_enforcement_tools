// analysisHandler.js

let excelData = [];

// 上傳B區段檔案處理
function handleFileUploadB(event) {
	const file = event.target.files[0];

	// 檢查檔案名稱是否包含 "客服-执法请求跟进"
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

// 開始分析
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

	const countryCountA = countCountries(filteredDataA);
	const countryCountB = countCountries(filteredDataB);

	displayAnalysisResults(countryCountA, countryCountB, triggerPercentage);
}

// 根據「申请编号」中的日期過濾
function filterDataByDate(startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);

	return excelData.filter(row => {
		const caseNumber = row['申请编号'];
		if (caseNumber && caseNumber.length >= 8) {
			const year = caseNumber.substring(0, 4);
			const month = caseNumber.substring(4, 6);
			const day = caseNumber.substring(6, 8);
			const date = new Date(`${year}-${month}-${day}`);

			if (!isNaN(date)) {
				return date >= start && date <= end;
			}
		}
		return false;
	});
}

// 計算各國家
function countCountries(data) {
	let countryCounter = {};

	data.forEach(row => {
		let country;
		if (row['是否中国大陆司法机构'] === '中国大陆') {
			country = '中国大陆';
		} else if (
			row['是否中国大陆司法机构'] === '否' &&
			row['司法机构-所在国家']
		) {
			country = row['司法机构-所在国家'].trim().toLowerCase();
		}

		if (country) {
			countryCounter[country] = (countryCounter[country] || 0) + 1;
		}
	});

	return countryCounter;
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
		countryCell.textContent = country;

		const countACell = document.createElement('td');
		countACell.textContent = countAValue;

		const countBCell = document.createElement('td');
		countBCell.textContent = countBValue;

		const growthCell = document.createElement('td');
		growthCell.textContent = growthPercentage.toFixed(2) + '%';

		// 若超過觸發百分比，底色標紅
		if (growthPercentage >= triggerPercentage) {
			row.style.backgroundColor = 'red';
		}

		row.appendChild(countryCell);
		row.appendChild(countACell);
		row.appendChild(countBCell);
		row.appendChild(growthCell);
		resultsBody.appendChild(row);
	});
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

