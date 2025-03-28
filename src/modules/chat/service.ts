import type { Server } from "socket.io";
import { db } from "../../db";
import { getUserById } from "../user/service";
import chatRepository from "./repository";
import type { Message, Recipient } from "./type";

export class ChatService {
	private io: Server;

	public constructor(io: Server) {
		this.io = io;
		this.initSocketEvents();
	}

	private initSocketEvents = async () => {
		this.io.on("connection", (socket) => {
			console.log("chat", socket.id);

			socket.on("join_chat", async (chatId: string) => {
				socket.join(chatId);
				console.log("join_chat", chatId);
			});

			socket.on("send_message", async (data: Message) => {
				console.log("send_message", data);
				const [message] = await chatRepository.insertMessage(db, data);
				const formattedMessage = {
					id: message.id,
					authorId: message.authorId,
					content: message.content,
					isRead: message.isRead,
					createdTime: message.createdTime,
				};
				this.io.to(data.chatId).emit("receive_message", formattedMessage);
			});

			socket.on("mark_as_read", async (chatId: string, userId: string) => {
				console.log("mark_as_read", chatId, userId);
				const unreadMessages = await chatRepository.getUnreadMessagesInChat(db, chatId, userId);
				unreadMessages.forEach(async (message) => {
					await chatRepository.updateReadStatusByMessageId(db, message.id, true);
					this.io.to(chatId).emit("read_message", message.id);
				});
			});

			socket.on("disconnect", () => {
				console.log("user disconnected:", socket.id);
			});
		});
	};

	createChat = async (user1: string, user2: string) => {
		return chatRepository.createChat(db, user1, user2);
	};

	listChat = async (userId: string) => {
		const chats = await chatRepository.listChat(db, userId);
		const chatList = chats.map(async (chat) => {
			// user
			const targetUserId = userId === chat.user1 ? chat.user2 : chat.user1;
			const user = await getUserById(targetUserId);
			const userMetaData = user.rawUserMetaData as Recipient;
			// message
			const lastMessages = await chatRepository.getLastMessage(db, chat.id);
			const unreadCount = await chatRepository.getNumberOfUnreadMessagesInChat(db, chat.id, userId);
			return {
				chat_id: chat.id,
				name: userMetaData.name,
				avatar: userMetaData.picture,
				last_message: {
					content: lastMessages[0]?.content || "",
					createdTime: lastMessages[0]?.createdTime || "",
				},
				unread_count: unreadCount[0]?.count || 0,
			};
		});
		return Promise.all(chatList);
	};

	getChat = async (userId: string, chatId: string) => {
		const [{ user1, user2 }] = await chatRepository.getChat(db, chatId);
		if (userId !== user1 && userId !== user2) {
			throw new Error("User is not part of this chat");
		}
		const targetUserId = userId === user1 ? user2 : user1;
		const targetUser = await getUserById(targetUserId);
		const targetUserMetaData = targetUser.rawUserMetaData as Recipient;
		const targetUserData = {
			name: targetUserMetaData.name,
			avatar: targetUserMetaData.picture,
		};

		const messages = await chatRepository.getMessagesByChatId(db, chatId);
		const formattedMessage = messages.map((message) => ({
			id: message.id,
			authorId: message.authorId,
			content: message.content,
			isRead: message.isRead,
			createdTime: message.createdTime,
		}));
		await chatRepository.updateReadStatus(db, chatId, userId, true);
		return { target: targetUserData, messages: formattedMessage };
	};

	addMessage = async (data: Message) => {
		return chatRepository.insertMessage(db, data);
	};
}
