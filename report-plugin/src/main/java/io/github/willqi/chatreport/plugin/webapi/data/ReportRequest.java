package io.github.willqi.chatreport.plugin.webapi.data;

import java.util.List;
import java.util.UUID;

public class ReportRequest {

    private final String secret;
    private final UUID uuid;
    private final List<ChatMessage> chat;


    public ReportRequest(String secret, UUID uuid, List<ChatMessage> chat) {
        this.secret = secret;
        this.uuid = uuid;
        this.chat = chat;
    }


}
