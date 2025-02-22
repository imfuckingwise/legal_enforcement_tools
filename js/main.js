// main.js

// 顯示/隱藏不同功能區
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
