import axiosClient from ".";

interface GetConversationParams {
  page?: number;
  limit?: number;
  type?: "direct" | "group" | "channel" | "broadcast";
}

interface ConversationPayload {
  type: "direct" | "group" | "channel" | "broadcast";
  participants: string[];
  name?: string;
  description?: string;
  avatar?: string;
}

interface UpdateConversationPayload {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: {
    allowInvites?: boolean;
    onlyAdminsCanPost?: boolean;
    slowMode?: {
      enabled: boolean;
      interval: number;
    };
    messageRetention?: number;
    joinMode?: "open" | "approval" | "invite";
    messageApproval?: boolean;
    antiSpam?: {
      enabled: boolean;
      maxMessagesPerMinute: number;
    };
  };
}

interface DeleteParticipantsPayload {
  participants: string[];
}

export const getConversations = async ({
  page = 1,
  limit = 10,
  type,
}: GetConversationParams = {}) => {
  return await axiosClient.get("/conversation", {
    params: {
      page,
      limit,
      type,
    },
  });
};

export const getConversationDetail = async (conversationId: string) => {
  return await axiosClient.get(`/conversation/${conversationId}`);
};

export const createConversation = async (
  payload: ConversationPayload
): Promise<any> => {
  return await axiosClient.post<any>("/conversation", payload);
};

export const updateConversation = async (
  conversationId: string,
  payload: UpdateConversationPayload
): Promise<any> => {
  return await axiosClient.put<any>(`/conversation/${conversationId}`, payload);
};

export const deleteConversation = async (
  conversationId: string
): Promise<any> => {
  return await axiosClient.delete<any>(`/conversation/${conversationId}`);
};

export const deleteParticipantConversation = async (
  conversationId: string,
  payload: DeleteParticipantsPayload
): Promise<any> => {
  return await axiosClient.delete<any>(
    `/conversation/${conversationId}/participants`,
    { data: payload }
  );
};

export const LeaveConversation = async (
  conversationId: string
): Promise<any> => {
  return await axiosClient.post<any>(`/conversation/${conversationId}/leave`);
};

export const AddParticipantConversation = async (
  conversationId: string,
  payload: any
): Promise<any> => {
  return await axiosClient.post<any>(
    `/conversation/${conversationId}/participants`,
    payload
  );
};
