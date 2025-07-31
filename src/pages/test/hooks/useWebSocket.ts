import { useEffect, useRef, useCallback } from "react";
import { WebSocketService } from "../../../services/WebSocketService.ts";
import { WEBSOCKET_CONFIG } from "../../../settings/websocket.config.ts";

interface UseWebSocketProps {
  taskId: string;
  onProgress: (progress: number, message: string) => void;
  onError: (message: string) => void;
  config?: typeof WEBSOCKET_CONFIG;
}

export const useWebSocket = ({
  taskId,
  onProgress,
  onError,
  config = WEBSOCKET_CONFIG,
}: UseWebSocketProps) => {
  const serviceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    serviceRef.current = WebSocketService.create(taskId, config);
    serviceRef.current.connect(
      ({ progress, message }) => onProgress(progress, message),
      onError,
    );

    return () => {
      serviceRef.current?.disconnect();
    };
  }, [taskId, onProgress, onError, config]);

  const isConnected = useCallback(() => {
    return serviceRef.current?.isConnected() ?? false;
  }, []);

  return { isConnected };
};
