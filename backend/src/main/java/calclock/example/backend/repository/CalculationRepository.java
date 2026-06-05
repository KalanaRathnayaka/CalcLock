package calclock.example.backend.repository;

import calclock.example.backend.model.Calculation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CalculationRepository extends MongoRepository<Calculation, String> {

    Optional<Calculation> findByOrderId(String orderId);

    List<Calculation> findTop10ByOrderByCreatedAtDesc();
}