/*************************************************
 * debug.ts
 * 全域除錯/記錄機制
 *************************************************/

// 調試模式開關：true => 顯示所有 debugLog / debugError ；false => 不印
(window as any).DEBUG_MODE = false;

/**
 * 一般除錯訊息
 * @param  {...any} args 要顯示的參數
 */
(window as any).debugLog = function(...args: any[]): void {
	if ((window as any).DEBUG_MODE) {
		console.log('[DEBUG]', ...args);
	}
};

/**
 * 錯誤層級訊息
 * @param  {...any} args 要顯示的參數
 */
(window as any).debugError = function(...args: any[]): void {
	if ((window as any).DEBUG_MODE) {
		console.error('[DEBUG ERROR]', ...args);
	}
};

/**
 * 全域錯誤監聽 (同步錯誤)
 */
window.addEventListener("error", function(e: ErrorEvent): void {
	console.error("[Global Error]", e.error || e.message);
	// 這裡可再加 fetch() 上傳到後端記錄
});

/**
 * 全域 Promise Rejection 監聽 (非同步錯誤)
 */
window.addEventListener("unhandledrejection", function(e: PromiseRejectionEvent): void {
	console.error("[Unhandled Promise Rejection]", e.reason);
	// 同理可上傳到後端 API
});
