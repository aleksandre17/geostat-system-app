export interface WebSocketConfig {
  url: string;
  reconnectDelay: number;
  topicPath: string;
}

export const WEBSOCKET_CONFIG: WebSocketConfig = {
  url: "http://localhost:8081/ws",
  reconnectDelay: 5000,
  topicPath: "/user/topic/progress",
};
