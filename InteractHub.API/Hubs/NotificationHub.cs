using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace InteractHub.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
}
