package io.github.willqi.chatreport.plugin.webapi.data;

import java.util.UUID;

public class ChatMessage {

    protected final UUID uuid;
    protected final String username;
    protected final String message;


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
