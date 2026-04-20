namespace Auth.API.Models.Entities;

public class RefreshToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime ExpTime { get; set; }
}
