// @ts-ignore
import * as CryptoJS from "crypto-js";

export const asyncHandler = (fn) => (req, res, next) => {
	return Promise.resolve(fn(req, res, next)).catch(next);
};

export const encryptMessage = (message: string) => {
	try {
		const ciphertext = CryptoJS.AES.encrypt(message, process.env.SECRET_KEY).toString();
		return ciphertext;
	} catch (error) {
		console.error("Error encrypting message:", error);
		return "";
	}
};

export const decryptMessage = (ciphertext: string) => {
	try {
		const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.SECRET_KEY);
		const originalText = bytes.toString(CryptoJS.enc.Utf8);
		return originalText;
	} catch (error) {
		console.error("Error decrypting message:", error);
		return "";
	}
};
