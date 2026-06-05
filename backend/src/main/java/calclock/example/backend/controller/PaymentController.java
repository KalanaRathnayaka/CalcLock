package calclock.example.backend.controller;

import calclock.example.backend.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping("/checkout/{orderId}")
    public Map<String, String> createCheckout(@PathVariable String orderId) throws Exception {
        String checkoutUrl = stripeService.createCheckoutSession(orderId);
        return Map.of("url", checkoutUrl);
    }
}