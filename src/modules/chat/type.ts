export interface Message {
	chatId: string;
	authorId: string;
	content: string;
	id?: string;
	isRead?: boolean;
	createdTime?: string;
	updatedTime?: string;
}

export interface Recipient {
	name: string;
	picture: string;
}
