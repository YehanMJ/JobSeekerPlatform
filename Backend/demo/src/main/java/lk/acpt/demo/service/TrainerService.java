package lk.acpt.demo.service;

import lk.acpt.demo.entity.Trainer;
import java.util.List;

public interface TrainerService {
    List<Trainer> getAllTrainers();
    Trainer getTrainerById(Integer id);
    Trainer createTrainer(Trainer trainer);
    Trainer updateTrainer(Integer id, Trainer trainer);
    void deleteTrainer(Integer id);
}
