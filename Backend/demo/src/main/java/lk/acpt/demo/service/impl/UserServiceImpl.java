package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.User;
import lk.acpt.demo.repositories.UserRepo;
import lk.acpt.demo.service.UserService;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JWTTokenGenerator jwtTokenGenerator;

    @Override
    public User register(User user) {
        // Encode password with Base64
        String encodedPassword = Base64.getEncoder().encodeToString(user.getPassword().getBytes(StandardCharsets.UTF_8));
        user.setPassword(encodedPassword);
        return userRepo.save(user);
    }

    @Override
    public String login(String username, String password) {
        Optional<User> userOpt = userRepo.findAll().stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst();
        if (userOpt.isPresent()) {
            String encodedPassword = Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8));
            if (userOpt.get().getPassword().equals(encodedPassword)) {
                // Generate JWT token using JWTTokenGenerator
                return jwtTokenGenerator.generateToken(userOpt.get());
            }
        }
        return null;
    }
}
