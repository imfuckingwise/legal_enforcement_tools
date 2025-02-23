// validations.js

// ====================
// BTC 地址與 TxID 驗證
// ====================
function isValidBTCAddress(address) {
	const legacyPattern			= /^[1][a-km-zA-HJ-NP-Z1-9]{24,33}$/;			// Legacy (P2PKH)：以 1 開頭，總長度 25～34
	const nestedSegwitPattern	= /^[3][a-km-zA-HJ-NP-Z1-9]{24,33}$/;			// Nested Segwit (P2SH-P2WPKH)：以 3 開頭，總長度 25～34
	const nativeSegwitPattern	= /^bc1q[a-z0-9]{8,87}$/;						// Native Segwit (P2WPKH)：以 bc1q 開頭（簡化檢查）
	const taprootPattern		= /^bc1p[a-z0-9]{8,87}$/;						// Taproot (P2TR)：以 bc1p 開頭（簡化檢查）
	const lowerAddress			= address.toLowerCase();
	
	return (
		legacyPattern.test(address) ||
		nestedSegwitPattern.test(address) ||
		nativeSegwitPattern.test(lowerAddress) ||
		taprootPattern.test(lowerAddress)
	);
}

function isValidBTCTxID(txid) {
	// BTC 的 TxID 通常為 64 位十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// EVM 地址與 TxID 驗證
// ====================
function isValidEVMAddress(address) {
	// EVM 地址：必須以 0x 開頭，後面跟 40 個十六進制字元
	const evmPattern = /^0x[a-fA-F0-9]{40}$/;
	return evmPattern.test(address);
}

function isValidEVMTxID(txid) {
	// EVM TxID：0x 開頭，後面 64 個十六進制字元
	const evmTxPattern = /^0x[a-fA-F0-9]{64}$/;
	return evmTxPattern.test(txid);
}

// ====================
// LTC 地址與 TxID 驗證
// ====================
function isValidLTCAddress(address) {
	// P2PKH：以 L 或 M 開頭，26～33 字元
	const p2pkhPattern	= /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/;
	// Bech32：以 ltc1 開頭，39～59 字元（簡化檢查）
	const bech32Pattern	= /^ltc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
	return p2pkhPattern.test(address) || bech32Pattern.test(address);
}

function isValidLTCTXID(txid) {
	// 假設 LTC TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}
// ====================
// TRON 地址與 TxID 驗證
// ====================
function isValidTRONAddress(address) {
	// TRON 地址：以 T 開頭，後面 33 個字元（共 34 字元），可包含大小寫與數字
	const tronPattern = /^T[a-zA-Z0-9]{33}$/;
	return tronPattern.test(address);
}

function isValidTRONTxID(txid) {
	// 假設 TRON TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// SOL 地址與 TxID 驗證
// ====================
function isValidSOLAddress(address) {
	// Solana 地址：Base58 格式，通常 32～44 字元
	const solPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
	return solPattern.test(address);
}

function isValidSOLTxID(txid) {
	// 假設 Solana TxID 為 88 個字元（由大小寫字母及數字組成）
	return /^[A-Za-z0-9]{88}$/.test(txid);
}
// ====================
// XMR 地址與 TxID 驗證
// ====================
function isValidXMRAddress(address) {
	// Monero 標準地址：95 字元；集成地址：106 字元（簡化檢查）
	const standardPattern	= /^[48][0-9A-Za-z]{94}$/;
	const integratedPattern	= /^[48][0-9A-Za-z]{105}$/;
	return standardPattern.test(address) || integratedPattern.test(address);
}

function isValidXMRTXID(txid) {
	// 假設 XMR TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// Kaspa 地址與 TxID 驗證
// ====================
function isValidKaspaAddress(address) {
	// 假設 Kaspa 地址以 "kaspa:" 開頭，後面至少 50 個小寫英數字
	const lowerAddr		= address.toLowerCase();
	const kaspaPattern	= /^kaspa:[a-z0-9]{50,}$/;
	return kaspaPattern.test(lowerAddr);
}
function isValidKaspaTxID(txid) {
	// 假設 Kaspa TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// Sui 地址與 TxID 驗證
// ====================
function isValidSuiAddress(address) {
	// 假設 Sui 地址必須以 0x 開頭，後面跟 64 個十六進制字元
	const suiPattern = /^0x[a-fA-F0-9]{64}$/;
	return suiPattern.test(address);
}
function isValidSuiTxID(txid) {
	// 假設 Sui TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// Aptos 地址與 TxID 驗證
// ====================
function isValidAptosAddress(address) {
	// 假設 Aptos 地址必須以 0x 開頭，後面跟 1～64 個十六進制字元
	const aptosPattern = /^0x[a-fA-F0-9]{1,64}$/;
	return aptosPattern.test(address);
}
function isValidAptosTxID(txid) {
	// 假設 Aptos TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// ADA 地址與 TxID 驗證
// ====================
function isValidADAAddress(address) {
	// ADA 地址有兩種格式：Shelley（以 addr1 開頭，50～120 字元）與 Byron（以 DdzFF 開頭，至少 50 字元）
	const shelleyPattern	= /^addr1[0-9a-z]{50,120}$/;
	const byronPattern		= /^DdzFF[1-9A-HJ-NP-Za-km-z]{50,}$/;
	return shelleyPattern.test(address) || byronPattern.test(address);
}
function isValidADATxID(txid) {
	// 假設 ADA TxID 為 64 個十六進制字元
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

// ====================
// 統合驗證：依據 infoType 來檢查 infoDetail
// ====================
function isValidInfo(infoType, infoDetail) {
	switch (infoType) {
		case "充值地址":
			return (
				isValidBTCAddress(infoDetail) ||
				isValidEVMAddress(infoDetail) ||
				isValidLTCAddress(infoDetail) ||
				isValidTRONAddress(infoDetail) ||
				isValidSOLAddress(infoDetail) ||
				isValidXMRAddress(infoDetail) ||
				isValidKaspaAddress(infoDetail) ||
				isValidSuiAddress(infoDetail) ||
				isValidAptosAddress(infoDetail) ||
				isValidADAAddress(infoDetail)
			);
		case "TXID":
			return (
				isValidEVMTxID(infoDetail) ||
				isValidLTCTXID(infoDetail) ||
				isValidTRONTxID(infoDetail) ||
				isValidSOLTxID(infoDetail) ||
				isValidXMRTXID(infoDetail) ||
				isValidKaspaTxID(infoDetail) ||
				isValidSuiTxID(infoDetail) ||
				isValidAptosTxID(infoDetail) ||
				isValidADATxID(infoDetail)
			);
		default:
			// 其他類型不進行格式檢查
			return true;
	}
}

// ====================
// 將函式掛載至全域 (讓其他檔案可以直接存取)
// ====================
window.isValidBTCAddress	= isValidBTCAddress;
window.isValidEVMAddress	= isValidEVMAddress;
window.isValidLTCAddress	= isValidLTCAddress;
window.isValidTRONAddress	= isValidTRONAddress;
window.isValidSOLAddress	= isValidSOLAddress;
window.isValidXMRAddress	= isValidXMRAddress;
window.isValidKaspaAddress	= isValidKaspaAddress;
window.isValidKaspaTxID		= isValidKaspaTxID;
window.isValidSuiAddress	= isValidSuiAddress;
window.isValidSuiTxID		= isValidSuiTxID;
window.isValidAptosAddress	= isValidAptosAddress;
window.isValidAptosTxID		= isValidAptosTxID;
window.isValidADAAddress	= isValidADAAddress;
window.isValidADATxID		= isValidADATxID;
window.isValidEVMTxID		= isValidEVMTxID;
window.isValidLTCTXID		= isValidLTCTXID;
window.isValidTRONTxID		= isValidTRONTxID;
window.isValidSOLTxID		= isValidSOLTxID;
window.isValidXMRTXID		= isValidXMRTXID;
window.isValidInfo		= isValidInfo;
