package io.github.willqi.chatreport.plugin.webapi.data;

import java.util.UUID;

public class ChatMessage {

    private final UUID uuid;
    private final String username;
    private final String message;


    public ChatMessage(UUID uuid, String username, String message) {
        this.uuid = uuid;
        this.username = username;
        this.message = message;
    }

    public UUID getUUID() {
        return this.uuid;
    }

    public String getUsername() {
        return this.username;
    }

    public String getMessage() {
        return this.message;
    }

}
