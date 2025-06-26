package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.Trainer;
import lk.acpt.demo.repositories.TrainerRepository;
import lk.acpt.demo.service.TrainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TrainerServiceImpl implements TrainerService {
    @Autowired
    private TrainerRepository trainerRepository;

    @Override
    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    @Override
    public Trainer getTrainerById(Integer id) {
        return trainerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trainer not found with id: " + id));
    }

    @Override
    public Trainer createTrainer(Trainer trainer) {
        return trainerRepository.save(trainer);
    }

    @Override
    public Trainer updateTrainer(Integer id, Trainer trainer) {
        Trainer existing = getTrainerById(id);
        existing.setExpertise(trainer.getExpertise());
        // set other fields as needed
        return trainerRepository.save(existing);
    }

    @Override
    public void deleteTrainer(Integer id) {
        trainerRepository.deleteById(id);
    }
}