package calclock.example.backend.service;

import calclock.example.backend.dto.CalculationResponse;
import calclock.example.backend.model.Calculation;
import calclock.example.backend.repository.CalculationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalculationService {

    private final CalculationRepository calculationRepository;

    public CalculationResponse createCalculation(String expression) {

        String orderId = UUID.randomUUID().toString();

        Double answer = calculateExpression(expression);

        Calculation calculation = Calculation.builder()
                .expression(expression)
                .answer(answer)
                .paid(false)
                .orderId(orderId)
                .createdAt(LocalDateTime.now())
                .build();

        calculationRepository.save(calculation);

        return CalculationResponse.builder()
                .orderId(orderId)
                .message("Calculation saved successfully. Pay to unlock the answer.")
                .paid(false)
                .build();
    }
    public CalculationResponse markAsPaid(String orderId) {

        Calculation calculation = calculationRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Calculation not found"));

        calculation.setPaid(true);
        calculationRepository.save(calculation);

        return CalculationResponse.builder()
                .orderId(orderId)
                .message("Payment successful. Answer unlocked.")
                .paid(true)
                .build();
    }
    public calclock.example.backend.dto.ResultResponse getResult(String orderId) {

        Calculation calculation = calculationRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Calculation not found"));

        if (!calculation.getPaid()) {
            return calclock.example.backend.dto.ResultResponse.builder()
                    .expression(calculation.getExpression())
                    .answer(null)
                    .paid(false)
                    .message("Payment required to unlock answer.")
                    .build();
        }

        return calclock.example.backend.dto.ResultResponse.builder()
                .expression(calculation.getExpression())
                .answer(calculation.getAnswer())
                .paid(true)
                .message("Answer unlocked successfully.")
                .build();
    }
    public void deleteAllHistory() {
        calculationRepository.deleteAll();
    }
    public java.util.List<Calculation> getHistory() {
        return calculationRepository.findTop10ByOrderByCreatedAtDesc();
    }

    private Double calculateExpression(String expression) {
        return new Object() {
            int pos = -1;
            int ch;

            void nextChar() {
                ch = (++pos < expression.length()) ? expression.charAt(pos) : -1;
            }

            boolean eat(int charToEat) {
                while (ch == ' ') nextChar();
                if (ch == charToEat) {
                    nextChar();
                    return true;
                }
                return false;
            }

            double parse() {
                nextChar();
                double x = parseExpression();
                if (pos < expression.length()) {
                    throw new RuntimeException("Invalid expression");
                }
                return x;
            }

            double parseExpression() {
                double x = parseTerm();
                while (true) {
                    if (eat('+')) x += parseTerm();
                    else if (eat('-')) x -= parseTerm();
                    else return x;
                }
            }

            double parseTerm() {
                double x = parseFactor();
                while (true) {
                    if (eat('*')) x *= parseFactor();
                    else if (eat('/')) x /= parseFactor();
                    else return x;
                }
            }

            double parseFactor() {
                if (eat('+')) return parseFactor();
                if (eat('-')) return -parseFactor();

                double x;
                int startPos = this.pos;

                if (eat('(')) {
                    x = parseExpression();
                    if (!eat(')')) {
                        throw new RuntimeException("Missing closing bracket");
                    }
                } else if ((ch >= '0' && ch <= '9') || ch == '.') {
                    while ((ch >= '0' && ch <= '9') || ch == '.') nextChar();
                    x = Double.parseDouble(expression.substring(startPos, this.pos));
                } else {
                    throw new RuntimeException("Invalid expression");
                }

                return x;
            }
        }.parse();
    }
}