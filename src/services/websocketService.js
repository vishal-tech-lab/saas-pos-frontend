import SockJS from "sockjs-client/dist/sockjs";
  import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (branchId, onMessageReceived) => {
  const socket = new SockJS("https://saas-pos-backend-m8et.onrender.com/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => {
      console.log("STOMP:", str);
    },
    onConnect: () => {
      console.log("WebSocket Connected");

      stompClient.subscribe(
        `/topic/customer-display/${branchId}`,
        (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            onMessageReceived(data);
          }
        }
      );
    },
    onStompError: (frame) => {
      console.error("STOMP Error:", frame);
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("WebSocket Disconnected");
  }
};
