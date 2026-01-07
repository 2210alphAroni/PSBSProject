import * as signalR from '@microsoft/signalr';

export class ChatService {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7272/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .catch(err => console.log(err));
  }

  sendMessage(user: string, message: string, isAdmin: boolean) {
    this.hubConnection.invoke('SendMessage', user, message, isAdmin);
  }

  receiveMessage(callback: any) {
    this.hubConnection.on('ReceiveMessage', callback);
  }
}
