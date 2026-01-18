// globals.d.ts - 全局類型聲明

declare global {
	interface Window {
		XLSX: any;
		jspdf: any;
		CHINESE_FONT_TTF: string;
		libphonenumber: any;
		DEBUG_MODE: boolean;
		debugLog: (...args: any[]) => void;
		debugError: (...args: any[]) => void;
		// 驗證函數
		isValidBTCAddress: (address: string) => boolean;
		isValidEVMAddress: (address: string) => boolean;
		isValidLTCAddress: (address: string) => boolean;
		isValidTRONAddress: (address: string) => boolean;
		isValidSOLAddress: (address: string) => boolean;
		isValidXMRAddress: (address: string) => boolean;
		isValidKaspaAddress: (address: string) => boolean;
		isValidKaspaTxID: (txid: string) => boolean;
		isValidSuiAddress: (address: string) => boolean;
		isValidSuiTxID: (txid: string) => boolean;
		isValidAptosAddress: (address: string) => boolean;
		isValidAptosTxID: (txid: string) => boolean;
		isValidADAAddress: (address: string) => boolean;
		isValidADATxID: (txid: string) => boolean;
		isValidEVMTxID: (txid: string) => boolean;
		isValidLTCTxID: (txid: string) => boolean;
		isValidTRONTxID: (txid: string) => boolean;
		isValidSOLTxID: (txid: string) => boolean;
		isValidXMRTxID: (txid: string) => boolean;
		isValidInfo: (infoType: string, infoDetail: string) => boolean;
		// 其他函數
		showSection: (sectionId: string) => void;
		toggleDarkMode: () => void;
		handleSingleInput: () => void;
		handleBulkInput: () => void;
		addRow: (infoType: string, infoDetail: string) => void;
		removeRow: (button: HTMLButtonElement) => void;
		copyAllData: () => void;
		deleteAllData: () => void;
		saveFile: () => void;
		importFile: () => void;
		handleMultipleFiles: (event: Event) => void;
		analyzeFiles: () => void;
		copyAllUniqueUIDs: () => void;
		copyAllTxidAndAddress: () => void;
		handleFileUploadB: (event: Event) => void;
		startAnalysis: () => void;
		generateAndCopyExceedingReport: () => void;
		generateAndCopyTopNReport: (isPDFExport?: boolean) => Array<[string, string]>;
		exportPDFReport: () => void;
		updateDataCount: () => void;
	}
}

export {};
