package calclock.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalculationResponse {

    private String orderId;
    private String message;
    private Boolean paid;

}