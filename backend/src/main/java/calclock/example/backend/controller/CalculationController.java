package calclock.example.backend.controller;

import calclock.example.backend.dto.CalculationRequest;
import calclock.example.backend.dto.CalculationResponse;
import calclock.example.backend.service.CalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculations")
@RequiredArgsConstructor
public class CalculationController {

    private final CalculationService calculationService;

    @PostMapping
    public CalculationResponse createCalculation(
            @RequestBody CalculationRequest request) {

        return calculationService.createCalculation(
                request.getExpression());
    }
    @PostMapping("/pay/{orderId}")
    public CalculationResponse payCalculation(@PathVariable String orderId) {
        return calculationService.markAsPaid(orderId);
    }
    @GetMapping("/result/{orderId}")
    public calclock.example.backend.dto.ResultResponse getResult(@PathVariable String orderId) {
        return calculationService.getResult(orderId);
    }
    @GetMapping("/history")
    public java.util.List<calclock.example.backend.model.Calculation> getHistory() {
        return calculationService.getHistory();
    }
    @DeleteMapping("/history")
    public String deleteAllHistory() {
        calculationService.deleteAllHistory();
        return "All calculation history deleted successfully";
    }

}