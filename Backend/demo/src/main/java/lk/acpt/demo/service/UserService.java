package lk.acpt.demo.service;

import lk.acpt.demo.entity.User;

public interface UserService {
    User register(User user);
    String login(String username, String password);
}
