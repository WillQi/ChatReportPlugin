package io.github.willqi.chatreport.plugin;

import com.google.gson.Gson;
import io.github.willqi.chatreport.plugin.webapi.data.RedisPunishment;
import redis.clients.jedis.DefaultJedisClientConfig;
import redis.clients.jedis.HostAndPort;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

public class RedisThread extends Thread {

    private final static String CHANNEL_NAME = "chatreports:punishment";
    private final static Gson GSON = new Gson();

    private final ChatReportPlugin plugin;
    private final Jedis jedis;

    public RedisThread(ChatReportPlugin plugin) {
        this.plugin = plugin;

        this.jedis = new Jedis(
                new HostAndPort(this.plugin.getConfig().getString("redis-host"), this.plugin.getConfig().getInt("redis-port")),
                DefaultJedisClientConfig.builder()
                        .user(this.plugin.getConfig().getString("redis-username"))
                        .password(this.plugin.getConfig().getString("redis-password"))
                        .build()
        );
    }

    @Override
    public void run() {
        this.jedis.subscribe(new JedisPubSub() {
            @Override
            public void onMessage(String channel, String message) {
                RedisPunishment punishment = GSON.fromJson(message, RedisPunishment.class);
                RedisThread.this.plugin.getPunishmentManager().onReceivedPunishment(punishment);
            }
        }, CHANNEL_NAME);
    }

    @Override
    public void interrupt() {
        this.jedis.close();
        super.interrupt();
    }
}
