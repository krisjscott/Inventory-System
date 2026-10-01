package com.example.orderapi.service;

import com.example.orderapi.model.AppUser;
import com.example.orderapi.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuthUserPersistenceService {

    private final AppUserRepository appUserRepository;

    public OAuthUserPersistenceService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public void recordGoogleLogin(String subject, String email, String displayName) {
        AppUser user = appUserRepository.findByGoogleSubject(subject)
                .orElseGet(() -> new AppUser(subject, email, displayName));
        if (user.getId() != null) {
            user.updateProfile(email, displayName);
        }
        appUserRepository.save(user);
    }
}
