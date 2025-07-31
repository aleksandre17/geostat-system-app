// services/WebSocketService.ts
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import {
  WEBSOCKET_CONFIG,
  WebSocketConfig,
} from "../settings/websocket.config.ts";

interface ProgressUpdate {
  progress: number;
  message: string;
}

export class WebSocketService {
  private client: Client | null = null;
  private taskId: string;
  private config: WebSocketConfig;

  constructor(taskId: string, config: WebSocketConfig = WEBSOCKET_CONFIG) {
    this.taskId = taskId;
    this.config = config;
  }

  connect(
    onProgress: (update: ProgressUpdate) => void,
    onError: (message: string) => void,
  ): void {
    const token = localStorage.getItem("token");
    if (!token) {
      onError("No authentication token found");
      return;
    }

    const socket = new SockJS(this.config.url);
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        "X-Task-ID": this.taskId,
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: this.config.reconnectDelay,
      debug: (msg) => console.log("STOMP Debug:", msg),
      onConnect: () => {
        this.client?.subscribe(this.config.topicPath, (message: IMessage) => {
          try {
            const update = JSON.parse(message.body);
            onProgress(update);
          } catch (error) {
            onError("Error processing progress update");
          }
        });
      },
      onStompError: () => {
        onError("WebSocket STOMP error");
      },
      onWebSocketError: () => {
        onError("WebSocket connection failed");
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }

  isConnected(): boolean {
    return !!this.client?.connected;
  }

  static create(taskId: string, config?: WebSocketConfig): WebSocketService {
    return new WebSocketService(taskId, config);
  }
}
