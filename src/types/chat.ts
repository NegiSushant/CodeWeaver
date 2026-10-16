export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

// export type MessageRole = "user" | "assistant";

// export interface ChatMessage {
//   id: string;
//   role: MessageRole;
//   content: string;
//   createdAt: Date;
//   sources?: string[];
// }

// export interface AskRequest {
//   message: string;
//   history: [];
//   query: string;
// }

// export interface AskResponse {
//   query: string;
//   answer: string;
//   sources: string[];
// }
