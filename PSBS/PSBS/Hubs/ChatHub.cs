using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message, bool isAdmin)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message, isAdmin);
    }
}
