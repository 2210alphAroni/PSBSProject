import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private hubConnection!: signalR.HubConnection;
  private connected = false;

  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7272/chatHub')
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        this.connected = true;
        console.log('✅ SignalR connected');
      })
      .catch(err => {
        console.error('❌ SignalR error:', err);
        this.connected = false;
        throw err;
      });
  }

  isConnected(): boolean {
    return this.connected;
  }

  sendMessage(user: string, message: string, isAdmin: boolean) {
    if (!this.connected) {
      console.warn('⚠ Chat not connected yet');
      return;
    }
    return this.hubConnection.invoke('SendMessage', user, message, isAdmin);
  }

  receiveMessage(callback: any) {
    this.hubConnection.on('ReceiveMessage', callback);
  }
}
