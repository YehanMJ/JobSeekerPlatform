package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.TrainerDTO;
import lk.acpt.demo.entity.Trainer;
import lk.acpt.demo.repositories.TrainerRepository;
import lk.acpt.demo.service.TrainerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lk.acpt.demo.util.JWTTokenGenerator;

import java.util.List;
@CrossOrigin
@RestController
@RequestMapping("/api/trainers")
public class TrainerController {
    private static TrainerRepository trainerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;
    private final TrainerService trainerService;

    @Autowired
    public TrainerController(TrainerRepository trainerRepository, ModelMapper modelMapper, JWTTokenGenerator jwtTokenGenerator, TrainerService trainerService) {
        TrainerController.trainerRepository = trainerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
        this.trainerService = trainerService;
    }

    @GetMapping
    public ResponseEntity<List<TrainerDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<TrainerDTO> dtos = trainerRepository.findAll().stream()
                .map(trainer -> modelMapper.map(trainer, TrainerDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return trainerRepository.findById(id)
                .map(trainer -> ResponseEntity.ok(modelMapper.map(trainer, TrainerDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<TrainerDTO> create(@RequestBody TrainerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        Trainer trainer = modelMapper.map(dto, Trainer.class);
        Trainer saved = trainerService.createTrainer(trainer);
        TrainerDTO savedDto = modelMapper.map(saved, TrainerDTO.class);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerDTO> update(@PathVariable Integer id, @RequestBody TrainerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return trainerRepository.findById(id)
                .map(trainer -> {
                    modelMapper.map(dto, trainer);
                    return ResponseEntity.ok(modelMapper.map(trainerRepository.save(trainer), TrainerDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (trainerRepository.existsById(id)) {
                trainerRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<TrainerDTO> uploadProfilePicture(
            @PathVariable Integer id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Trainer updated = trainerService.uploadProfilePicture(id, file);
        TrainerDTO dto = modelMapper.map(updated, TrainerDTO.class);
        return ResponseEntity.ok(dto);
    }
}
