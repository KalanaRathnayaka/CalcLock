package calclock.example.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Calculation {
    @Id
    private String id;

    private String expression;
    private Double answer;
    private Boolean paid;
    private String orderId;
    private LocalDateTime createdAt;
}