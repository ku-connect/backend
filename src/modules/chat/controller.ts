import { type Request, type Response } from "express";
import type { ChatService } from "./service";

export class ChatController {
	private chatService;

	constructor(chatService: ChatService) {
		this.chatService = chatService;
	}

	createChat = async (req: Request, res: Response) => {
		const { user1, user2 } = req.body;
		console.log("createChat", user1, user2);
		const chat = await this.chatService.createChat(user1, user2);
		res.json(chat);
	};

	listChat = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		console.log("list chat", userId);
		const chats = await this.chatService.listChat(userId);
		res.json(chats);
	};

	// TODO: prevent user from getting chat that they are not part of
	getChatDataByChatId = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const { id: chatId } = req.params;
		console.log("getChatByChatId", chatId);
		const chat = await this.chatService.getChat(userId, chatId);
		res.json(chat);
	};

	addMessage = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const data = req.body;
		console.log("addMessage", data);
		const message = await this.chatService.addMessage({
			chatId: data.chat_id,
			authorId: userId,
			content: data.content,
		});
		res.json(message);
	};
}
