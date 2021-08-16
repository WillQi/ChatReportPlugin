package io.github.willqi.chatreport.plugin.webapi.data;

import java.util.List;
import java.util.UUID;

public class ReportRequest {

    protected final String secret;
    protected final UUID uuid;
    protected final String username;
    protected final List<ChatMessage> chat;


    public ReportRequest(String secret, UUID uuid, String username, List<ChatMessage> chat) {
        this.secret = secret;
        this.uuid = uuid;
        this.username = username;
        this.chat = chat;
    }


}
