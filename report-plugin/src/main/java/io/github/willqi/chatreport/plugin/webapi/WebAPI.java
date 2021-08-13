package io.github.willqi.chatreport.plugin.webapi;

import io.github.willqi.chatreport.plugin.webapi.data.*;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public class WebAPI {

    private final String secret;
    private final ReportService reportService;


    public WebAPI(String serverBaseURL, String secret) {
        this.secret = secret;

        Retrofit api = new Retrofit.Builder()
                .baseUrl(serverBaseURL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        this.reportService = api.create(ReportService.class);
    }

    /**
     * Retrieve the punishments of a player
     * @param uuid UUID of the player
     * @return punishments
     * @throws IOException if a web exception occured
     */
    public PunishmentResponse getPunishments(UUID uuid) throws IOException {
        return this.reportService.getPunishments(this.secret, uuid)
                .execute().body();
    }

    /**
     * Create a punishment on a player
     * @param uuid UUID of the player
     * @param messages chat messages to upload
     * @return {@link ReportResponse}
     * @throws IOException if a web exception occured
     */
    public ReportResponse createReport(UUID uuid, List<ChatMessage> messages) throws IOException {
        return this.reportService.createReport(new ReportRequest(this.secret, uuid, messages))
                .execute().body();
    }

}
