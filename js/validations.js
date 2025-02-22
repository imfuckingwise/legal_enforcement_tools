// validations.js

// ====================
// 區塊鏈地址驗證
// ====================
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

function isValidXMRAddress(address) {
	// Monero 標準地址為 95 個字符，且以 '4' 或 '8' 開頭
	// Monero 集成地址為 106 個字符，且以 '4' 或 '8' 開頭
	const standardPattern = /^[48][0-9A-Za-z]{94}$/;
	const integratedPattern = /^[48][0-9A-Za-z]{105}$/;
	return standardPattern.test(address) || integratedPattern.test(address);
}

// ====================
// TXID 驗證
// ====================
function isValidTXID(txid) {
	return (
		isValidBTCTXID(txid) ||
		isValidEVMTXID(txid) ||
		isValidLTCTXID(txid) ||
		isValidTRONTXID(txid) ||
		isValidSOLTXID(txid) ||
		isValidXMRTXID(txid)
	);
}

function isValidBTCTXID(txid) {
	// BTC 的 TXID 是64位十六進制字符
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

function isValidEVMTXID(txid) {
	// EVM 的 TXID 是64位十六進制字符，並且必須以 0x 開頭
	return /^0x[a-fA-F0-9]{64}$/.test(txid);
}

function isValidLTCTXID(txid) {
	// LTC 的 TXID 是64位十六進制字符
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

function isValidTRONTXID(txid) {
	// TRON (TRC-20) 的 TXID 是64位十六進制字符
	return /^[a-fA-F0-9]{64}$/.test(txid);
}

function isValidSOLTXID(txid) {
	// Solana 的 TXID 是88個字符，包含字母和數字
	return /^[A-Za-z0-9]{88}$/.test(txid);
}

function isValidXMRTXID(txid) {
	// Monero 的 TXID 為64個字符，僅包含十六進制字符 (0-9, a-f, A-F)
	return /^[a-fA-F0-9]{64}$/.test(txid);
}
