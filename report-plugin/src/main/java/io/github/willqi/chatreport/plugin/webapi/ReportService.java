package io.github.willqi.chatreport.plugin.webapi;

import io.github.willqi.chatreport.plugin.webapi.data.Punishment;
import io.github.willqi.chatreport.plugin.webapi.data.ReportRequest;
import io.github.willqi.chatreport.plugin.webapi.data.ReportResponse;
import retrofit2.Call;
import retrofit2.http.*;

import java.util.Set;
import java.util.UUID;

public interface ReportService {

    @POST("server/punishments/{uuid}")
    @FormUrlEncoded
    Call<Set<Punishment>> getPunishments(@Field("secret") String secret, @Path("uuid") UUID uuid);

    @POST("server/reports")
    Call<ReportResponse> createReport(@Body ReportRequest request);


}
