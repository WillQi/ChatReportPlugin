package io.github.willqi.chatreport.plugin.commands;

import io.github.willqi.chatreport.plugin.ChatReportPlugin;
import io.github.willqi.chatreport.plugin.utils.TextUtils;
import io.github.willqi.chatreport.plugin.webapi.data.ChatMessage;
import io.github.willqi.chatreport.plugin.webapi.data.ReportResponse;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

public class ChatReportCommand implements CommandExecutor, Listener {

    private final ArrayDeque<ChatMessage> chatLog = new ArrayDeque<>();

    private final ChatReportPlugin plugin;


    public ChatReportCommand(ChatReportPlugin plugin) {
        this.plugin = plugin;
        this.plugin.getServer().getPluginManager().registerEvents(this, this.plugin);
    }

    @Override
    public boolean onCommand(CommandSender commandSender, Command command, String label, String[] args) {
        if (args.length < 1) {
            return false;
        }
        String playerName = args[0];
        Player player = this.plugin.getServer().getPlayerExact(playerName);
        if (player == null) {
            commandSender.sendMessage(TextUtils.formatMessage("ChatReport", "That player is not online", ChatColor.RED));
            return true;
        }

        if (this.chatLog.size() == 0) {
            commandSender.sendMessage(TextUtils.formatMessage("ChatReport", "There are no messages recorded", ChatColor.RED));
            return true;
        }

        this.plugin.getServer().getScheduler().runTaskAsynchronously(this.plugin, () -> {
            List<ChatMessage> chatMessages;
            synchronized (this.chatLog) {
                chatMessages = new ArrayList<>(this.chatLog);
            }

            try {
                ReportResponse response = this.plugin.getWebAPI().createReport(player.getUniqueId(), player.getName(), chatMessages);
                this.plugin.getServer().getScheduler().runTask(this.plugin, () -> {
                    if (response.getStatus() == 200) {
                        commandSender.sendMessage(TextUtils.formatMessage("ChatReport", "Report sent!"));
                    } else {
                        commandSender.sendMessage(TextUtils.formatMessage("ChatReport", response.getMessage(), ChatColor.RED));
                    }
                });
            } catch (IOException exception) {
                this.plugin.getLogger().log(Level.SEVERE, "An error has occurred when creating a chat report", exception);
                this.plugin.getServer().getScheduler()
                        .runTask(this.plugin, () -> commandSender.sendMessage(TextUtils.formatMessage("ChatReport", "An internal error occurred!", ChatColor.RED)));
            }
        });
        return true;
    }

    @EventHandler(ignoreCancelled = true, priority = EventPriority.MONITOR)
    public void onChatMessage(AsyncPlayerChatEvent event) {
        // Add to chat log
        synchronized (this.chatLog) {
            if (this.chatLog.size() >= this.plugin.getConfig().getInt("max-chat-log-size")) {
                // Limit chat log size to the configured amount
                this.chatLog.removeFirst();
            }
            this.chatLog.add(new ChatMessage(event.getPlayer().getUniqueId(), event.getPlayer().getName(), event.getMessage()));
        }
    }

}
