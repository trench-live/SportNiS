package com.sportnis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sportnis.api.auth.dto.AuthResponse;
import com.sportnis.api.auth.dto.RegisterRequest;
import com.sportnis.entity.enums.OnboardingStep;
import com.sportnis.entity.enums.ProfileType;
import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.user.User;
import com.sportnis.repository.profile.ProfileRepository;
import com.sportnis.repository.user.UserRepository;
import com.sportnis.security.JwtService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerStoresUsernameAndCreatesDefaultProfile() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        when(userRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("alex.runner")).thenReturn(false);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null) {
                ReflectionTestUtils.setField(user, "id", userId);
            }
            return user;
        });
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> {
            Profile profile = invocation.getArgument(0);
            if (profile.getId() == null) {
                ReflectionTestUtils.setField(profile, "id", profileId);
            }
            return profile;
        });
        when(jwtService.generateToken(eq(userId))).thenReturn("jwt-token");

        RegisterRequest request = new RegisterRequest(
                "User@Example.com",
                null,
                "Passw0rd!",
                "Alex.Runner",
                ProfileType.CONSUMER
        );

        AuthResponse response = authService.register(request);

        assertEquals("jwt-token", response.token());
        assertEquals(userId, response.userId());
        assertEquals(profileId, response.profileId());
        assertEquals(ProfileType.CONSUMER, response.profileType());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, atLeastOnce()).save(userCaptor.capture());
        List<User> savedUsers = userCaptor.getAllValues();
        assertNotNull(savedUsers.get(0));
        assertEquals("alex.runner", savedUsers.get(0).getUsername());
        assertEquals(OnboardingStep.REGISTERED, savedUsers.get(0).getOnboardingStep());

        ArgumentCaptor<Profile> profileCaptor = ArgumentCaptor.forClass(Profile.class);
        verify(profileRepository).save(profileCaptor.capture());
        assertEquals("New consumer", profileCaptor.getValue().getDisplayName());
    }

    @Test
    void deleteMeDeletesExistingUser() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));

        authService.deleteMe(userId);

        verify(userRepository).delete(user);
    }
}

