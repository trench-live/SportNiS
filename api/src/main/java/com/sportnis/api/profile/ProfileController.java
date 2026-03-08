package com.sportnis.api.profile;

import com.sportnis.api.profile.dto.ProfileResponse;
import com.sportnis.api.profile.dto.ProfileUpdateRequest;
import com.sportnis.security.CurrentUserProvider;
import com.sportnis.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private final CurrentUserProvider currentUserProvider;

    public ProfileController(ProfileService profileService, CurrentUserProvider currentUserProvider) {
        this.profileService = profileService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/me")
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    public ProfileResponse getMyProfile() {
        return profileService.getMyProfile(currentUserProvider.getCurrentUserId());
    }

    @PutMapping("/me")
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    public ProfileResponse updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return profileService.updateMyProfile(currentUserProvider.getCurrentUserId(), request);
    }
}
