package io.github.willqi.chatreport.plugin;

import io.github.willqi.chatreport.plugin.commands.ChatReportCommand;
import io.github.willqi.chatreport.plugin.webapi.WebAPI;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;
import org.bukkit.plugin.java.JavaPlugin;

public class ChatReportPlugin extends JavaPlugin implements Listener {

    private WebAPI webAPI;

    @Override
    public void onEnable() {
        this.saveDefaultConfig();

        this.webAPI = new WebAPI(
                this.getConfig().getString("website-base-url"),
                this.getConfig().getString("website-secret")
        );

        this.getServer().getPluginManager().registerEvents(this, this);

        this.getCommand("chatreport").setExecutor(new ChatReportCommand());
    }

    public WebAPI getWebAPI() {
        return this.webAPI;
    }

    @EventHandler
    public void onPlayerChat(AsyncPlayerChatEvent event) {
        // TODO: store messages
        // TODO: check punishments cache to see if player is muted
    }

    @EventHandler
    public void onPlayerConnect(AsyncPlayerPreLoginEvent event) {
        // TODO: fetch punishments from API
    }

}
