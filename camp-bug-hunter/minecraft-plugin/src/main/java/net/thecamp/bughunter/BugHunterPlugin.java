package net.thecamp.bughunter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class BugHunterPlugin extends JavaPlugin {
  private final Gson gson = new Gson();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  @Override
  public void onEnable() {
    saveDefaultConfig();
  }

  @Override
  public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    if (!command.getName().equalsIgnoreCase("bughunter")) {
      return false;
    }

    if (args.length != 1 || !args[0].equalsIgnoreCase("register")) {
      sender.sendMessage(ChatColor.RED + "Usage: /bughunter register");
      return true;
    }

    if (!(sender instanceof Player player)) {
      sender.sendMessage(ChatColor.RED + "Only players can use this command.");
      return true;
    }

    String apiUrl = getConfig().getString("apiUrl", "");
    if (apiUrl.isBlank()) {
      player.sendMessage(ChatColor.RED + "Registration service is not configured.");
      return true;
    }

    Bukkit.getScheduler().runTaskAsynchronously(this, () -> requestCode(player, apiUrl));
    return true;
  }

  private void requestCode(Player player, String apiUrl) {
    try {
      JsonObject payload = new JsonObject();
      payload.addProperty("minecraftUsername", player.getName());
      payload.addProperty("playerUuid", player.getUniqueId().toString());

      HttpRequest.Builder builder =
          HttpRequest.newBuilder(URI.create(apiUrl))
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)));

      String token = getConfig().getString("pluginToken", "");
      if (!token.isBlank()) {
        builder.header("x-plugin-token", token);
      }

      HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() != 201) {
        sendMessage(player, ChatColor.RED + "Could not create a verification code.");
        return;
      }

      JsonObject body = gson.fromJson(response.body(), JsonObject.class);
      String code = body != null && body.has("code") ? body.get("code").getAsString() : "";
      if (code.isBlank()) {
        sendMessage(player, ChatColor.RED + "Verification code missing from response.");
        return;
      }

      sendMessage(player, ChatColor.GOLD + "Your verification code: " + ChatColor.WHITE + code);
      sendMessage(player, ChatColor.GRAY + "Use it on the website to register.");
    } catch (Exception error) {
      sendMessage(player, ChatColor.RED + "Could not reach the registration service.");
    }
  }

  private void sendMessage(Player player, String message) {
    Bukkit.getScheduler().runTask(this, () -> player.sendMessage(message));
  }
}
