package io.github.willqi.chatreport.plugin;

import io.github.willqi.chatreport.plugin.utils.TextUtils;
import io.github.willqi.chatreport.plugin.webapi.data.Punishment;
import io.github.willqi.chatreport.plugin.webapi.data.PunishmentResponse;
import io.github.willqi.chatreport.plugin.webapi.data.RedisPunishment;
import org.bukkit.ChatColor;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;
import org.bukkit.event.player.PlayerQuitEvent;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.stream.Collectors;

public class PunishmentManager implements Listener {

    private final ChatReportPlugin plugin;

    private final Map<UUID, Set<Punishment>> onlinePlayersCache = new ConcurrentHashMap<>();


    public PunishmentManager(ChatReportPlugin plugin) {
        this.plugin = plugin;
        this.plugin.getServer().getPluginManager().registerEvents(this, this.plugin);
    }

    /**
     * Retrieve the punishments of a UUID
     * It will insert the punishments into the onlinePlayerCache if a key exists
     * @param uuid UUID
     * @param forceFetch If the punishments should be fetched from the database regardless of the cache
     * @return active punishments
     * @throws IOException
     */
    public Set<Punishment> getPunishments(UUID uuid, boolean forceFetch) throws IOException {
        Set<Punishment> punishments = this.onlinePlayersCache.getOrDefault(uuid, null);
        if (punishments != null && !forceFetch) {
            // Expire old punishments
            punishments.removeIf(punishment -> !punishment.isActive());
            return punishments;
        }

        PunishmentResponse punishmentResponse = this.plugin.getWebAPI().getPunishments(uuid);
        if (punishmentResponse.getStatus() == 200) {
            this.onlinePlayersCache.computeIfPresent(uuid, (oldKey, oldPunishments) -> {
                oldPunishments.addAll(punishmentResponse.getPunishments());
                return oldPunishments;
            });
            return this.onlinePlayersCache.getOrDefault(uuid, punishmentResponse.getPunishments());
        } else {
            throw new IOException(punishmentResponse.getMessage());
        }
    }

    /**
     * Called when a punishment is received from redis
     * @param punishment
     */
    void onReceivedPunishment(RedisPunishment punishment) {
        Set<Punishment> punishments = this.onlinePlayersCache.getOrDefault(punishment.getUUID(), null);
        if (punishments != null) {
            punishments.add(punishment);

            if (punishment.getType() == Punishment.Type.BAN) {
                this.plugin.getServer().getScheduler().runTask(this.plugin, () ->
                        this.plugin.getServer().getPlayer(punishment.getUUID()).kickPlayer("You are banned for your chat behaviour!"));
            }
        }
    }

    public boolean isMuted(UUID uuid) throws IOException {
        return this.getPunishments(uuid, false)
                .stream().anyMatch(punishment -> punishment.getType() == Punishment.Type.MUTE);
    }

    public boolean isBanned(UUID uuid) throws IOException {
        return this.getPunishments(uuid, false)
                .stream().anyMatch(punishment -> punishment.getType() == Punishment.Type.BAN);
    }

    // Handles mutes
    @EventHandler
    public void onPlayerMessage(AsyncPlayerChatEvent event) {
        try {
            if (this.isMuted(event.getPlayer().getUniqueId())) {
                event.getPlayer().getServer().getScheduler()
                        .runTask(this.plugin, () -> event.getPlayer().sendMessage(TextUtils.formatMessage("Mute", "Sorry, you are muted!", ChatColor.RED)));
                event.setCancelled(true);
            }
        } catch (IOException exception) {
            this.plugin.getLogger().log(Level.SEVERE, "An exception occurred while checking if a player was muted", exception);
        }
    }

    // Handles bans
    @EventHandler
    public void onPlayerPreJoin(AsyncPlayerPreLoginEvent event)  {
        this.onlinePlayersCache.put(event.getUniqueId(), ConcurrentHashMap.newKeySet());
        try {
            this.getPunishments(event.getUniqueId(), true);
            if (this.isBanned(event.getUniqueId())) {
                event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_BANNED, "You are banned for your chat behaviour!");
            }
        } catch (IOException exception) {
            this.plugin.getLogger().log(Level.SEVERE, "An exception occurred while checking if a player was banned", exception);
        }
    }

    // Clear punishment cache on leave
    @EventHandler
    public void onPlayerLeave(PlayerQuitEvent event) {
        this.onlinePlayersCache.remove(event.getPlayer().getUniqueId());
    }

}
