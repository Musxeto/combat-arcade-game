import { useEffect, useRef, useState, useCallback } from 'react';

export interface WSMessage {
  type: string;
  data?: any;
}

export function useWebSocket(url: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!url) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    let isUnmounted = false;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isUnmounted) {
            setIsConnected(true);
            setConnectionError(null);
          }
        };

        ws.onmessage = (event) => {
          if (!isUnmounted) {
            try {
              const parsed = JSON.parse(event.data);
              setLastMessage(parsed);
            } catch (e) {
              console.error('Failed to parse WebSocket message', e);
            }
          }
        };

        ws.onerror = () => {
          if (!isUnmounted) {
            setConnectionError('WebSocket connection error.');
          }
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            setIsConnected(false);
            // Attempt auto-reconnect after 2 seconds if still mounted
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!isUnmounted && url) {
                connect();
              }
            }, 2000);
          }
        };
      } catch (err: any) {
        if (!isUnmounted) {
          setConnectionError(err.message || 'Failed to connect');
        }
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  const sendMessage = useCallback((type: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
  };
}
