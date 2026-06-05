package calclock.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResultResponse {

    private String expression;
    private Double answer;
    private Boolean paid;
    private String message;
}