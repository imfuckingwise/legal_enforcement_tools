// main.ts

// 顯示/隱藏不同功能區
function showSection(sectionId: string): void {
	const sections = ['inputSection', 'outputSection', 'analysisSection'];
	sections.forEach(id => {
		const element = document.getElementById(id);
		if (element) {
			element.classList.add('d-none');
		}
	});
	const targetSection = document.getElementById(sectionId);
	if (targetSection) {
		targetSection.classList.remove('d-none');
	}
}

// 切換深色模式
function toggleDarkMode(): void {
	const body = document.body;
	body.classList.toggle('dark-mode');

	// 更新深色模式按鈕的文字
	const toggleButton = document.getElementById('toggleDarkMode');
	if (toggleButton) {
		if (body.classList.contains('dark-mode')) {
			toggleButton.innerText = '切換淺色模式';
		} else {
			toggleButton.innerText = '切換深色模式';
		}
	}
}

// 初始化時自動偵測系統主題
window.onload = function(): void {
	const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
	const toggleButton = document.getElementById('toggleDarkMode');

	if (prefersDarkScheme.matches) {
		document.body.classList.add("dark-mode");
		if (toggleButton) {
			toggleButton.innerText = '切換淺色模式';
		}
	} else {
		document.body.classList.remove("dark-mode");
		if (toggleButton) {
			toggleButton.innerText = '切換深色模式';
		}
	}
};

// 將函數掛載到全域
(window as any).showSection = showSection;
(window as any).toggleDarkMode = toggleDarkMode;
