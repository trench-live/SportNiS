package com.sportnis.api.profile;

import com.sportnis.api.profile.dto.ConsumerDetailsResponse;
import com.sportnis.api.profile.dto.ConsumerDetailsUpdateRequest;
import com.sportnis.api.profile.dto.MyProfileItemResponse;
import com.sportnis.api.profile.dto.ProfileCreateRequest;
import com.sportnis.api.profile.dto.ProfileDetailsResponse;
import com.sportnis.api.profile.dto.ProfilePrivacyUpdateRequest;
import com.sportnis.api.profile.dto.ProfileResponse;
import com.sportnis.api.profile.dto.ProfileSearchingUpdateRequest;
import com.sportnis.api.profile.dto.ProfileUpdateRequest;
import com.sportnis.api.profile.dto.ProviderDetailsResponse;
import com.sportnis.api.profile.dto.ProviderDetailsUpdateRequest;
import com.sportnis.api.profile.dto.SwitchProfileRequest;
import com.sportnis.security.CurrentUserProvider;
import com.sportnis.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;
import java.util.List;

@Tag(name = "Profiles", description = "Работа с профилями пользователя и деталями профиля")
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
    @Operation(
            summary = "Получить активный профиль",
            description = "Возвращает текущий активный профиль авторизованного пользователя.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse getMyProfile() {
        return profileService.getMyProfile(currentUserProvider.getCurrentUserId());
    }

    @GetMapping("/my")
    @Operation(
            summary = "Получить список моих профилей",
            description = "Возвращает все профили аккаунта с флагом active у текущего активного профиля.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public List<MyProfileItemResponse> listMyProfiles() {
        return profileService.listMyProfiles(currentUserProvider.getCurrentUserId());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Получить публичный профиль",
            description = "Возвращает публичную карточку профиля по ID. Непубличные профили скрыты."
    )
    public ProfileResponse getPublicProfile(@PathVariable UUID id) {
        return profileService.getPublicProfile(id);
    }

    @GetMapping("/public")
    @Operation(
            summary = "List public profiles",
            description = "Returns public profiles for guest browsing."
    )
    public List<ProfileResponse> listPublicProfiles() {
        return profileService.listPublicProfiles();
    }

    @GetMapping("/public/searching")
    @Operation(
            summary = "List public searching consumer profiles",
            description = "Returns public CONSUMER profiles with enabled \"in search\" flag."
    )
    public List<ProfileResponse> listPublicSearchingProfiles() {
        return profileService.listPublicSearchingProfiles();
    }

    @PostMapping
    @Operation(
            summary = "Создать профиль",
            description = "Создает новый профиль для текущего аккаунта (CONSUMER или PROVIDER).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse createMyProfile(@Valid @RequestBody ProfileCreateRequest request) {
        return profileService.createMyProfile(currentUserProvider.getCurrentUserId(), request);
    }

    @PostMapping("/me/switch")
    @Operation(
            summary = "Переключить активный профиль",
            description = "Меняет активный профиль аккаунта. После переключения /me и /me/details работают с новым профилем.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse switchMyProfile(@Valid @RequestBody SwitchProfileRequest request) {
        return profileService.switchMyProfile(currentUserProvider.getCurrentUserId(), request.profileId());
    }

    @PostMapping("/{id}/clear")
    @Operation(
            summary = "Очистить профиль",
            description = "Сбрасывает поля профиля и details к значениям по умолчанию без удаления профиля.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse clearMyProfile(@PathVariable UUID id) {
        return profileService.clearMyProfile(currentUserProvider.getCurrentUserId(), id);
    }

    @PutMapping("/me")
    @Operation(
            summary = "Обновить активный профиль",
            description = "Полное обновление базовых полей активного профиля.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return profileService.updateMyProfile(currentUserProvider.getCurrentUserId(), request);
    }

    @PatchMapping("/me/privacy")
    @Operation(
            summary = "Обновить настройки приватности",
            description = "Частичное обновление privacy-флагов активного профиля.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse patchMyPrivacy(@Valid @RequestBody ProfilePrivacyUpdateRequest request) {
        return profileService.patchMyPrivacy(currentUserProvider.getCurrentUserId(), request);
    }

    @PutMapping("/me/searching")
    @Operation(
            summary = "Переключить режим поиска",
            description = "Включает или выключает попадание активного consumer-профиля в публичную выборку \"в поиске\".",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileResponse updateMySearching(@Valid @RequestBody ProfileSearchingUpdateRequest request) {
        return profileService.updateMySearching(currentUserProvider.getCurrentUserId(), request);
    }

    @GetMapping("/me/details")
    @Operation(
            summary = "Получить details активного профиля",
            description = "Возвращает details по типу активного профиля: consumerDetails или providerDetails.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProfileDetailsResponse getMyDetails() {
        return profileService.getMyDetails(currentUserProvider.getCurrentUserId());
    }

    @PutMapping("/me/details/consumer")
    @Operation(
            summary = "Обновить ConsumerDetails",
            description = "Обновляет details активного профиля типа CONSUMER.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ConsumerDetailsResponse updateConsumerDetails(@Valid @RequestBody ConsumerDetailsUpdateRequest request) {
        return profileService.updateConsumerDetails(currentUserProvider.getCurrentUserId(), request);
    }

    @PutMapping("/me/details/provider")
    @Operation(
            summary = "Обновить ProviderDetails",
            description = "Обновляет details активного профиля типа PROVIDER.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ProviderDetailsResponse updateProviderDetails(@Valid @RequestBody ProviderDetailsUpdateRequest request) {
        return profileService.updateProviderDetails(currentUserProvider.getCurrentUserId(), request);
    }
}
