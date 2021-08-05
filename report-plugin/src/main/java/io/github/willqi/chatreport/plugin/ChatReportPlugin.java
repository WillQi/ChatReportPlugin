package io.github.willqi.chatreport.plugin;

import io.github.willqi.chatreport.plugin.commands.ChatReportCommand;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;
import org.bukkit.plugin.java.JavaPlugin;

public class ChatReportPlugin extends JavaPlugin implements Listener {

    @Override
    public void onEnable() {
        this.getServer().getPluginManager().registerEvents(this, this);
        this.getCommand("chatreport").setExecutor(new ChatReportCommand());
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
