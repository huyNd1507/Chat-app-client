import axiosClient from ".";

interface GetMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

interface SendMessagePayload {
  conversationId: string;
  content: string | any;
  type: "text" | "media" | "file" | "location" | "call";
}

interface EditMessagePayload {
  content: string;
}

interface ReactionPayload {
  emoji: string;
}

interface MarkMultipleMessagesAsReadPayload {
  messageIds: string[];
  conversationId: string;
}

export const getMessages = async ({
  conversationId,
  page = 1,
  limit = 20,
}: GetMessagesParams) => {
  return await axiosClient.get(`/messages/conversation/${conversationId}`, {
    params: {
      page,
      limit,
    },
  });
};

export const sendMessage = async (payload: SendMessagePayload) => {
  return await axiosClient.post("/messages", payload);
};

export const editMessage = async (
  messageId: string,
  payload: EditMessagePayload
) => {
  return await axiosClient.put(`/messages/${messageId}`, payload);
};

export const deleteMessage = async (messageId: string) => {
  return await axiosClient.delete(`/messages/${messageId}`);
};

export const markMessageAsRead = async (messageId: string) => {
  return await axiosClient.put(`/messages/${messageId}/read`);
};

export const markMultipleMessagesAsRead = async (
  payload: MarkMultipleMessagesAsReadPayload
) => {
  return await axiosClient.post("/messages/mark-multiple-read", payload);
};

export const addReaction = async (
  messageId: string,
  payload: ReactionPayload
) => {
  return await axiosClient.post(`/messages/${messageId}/reactions`, payload);
};

export const removeReaction = async (messageId: string, reactionId: string) => {
  return await axiosClient.delete(
    `/messages/${messageId}/reactions/${reactionId}`
  );
};
