package com.sportnis.api.listing;

import com.sportnis.api.listing.dto.ListingCreateRequest;
import com.sportnis.api.listing.dto.ListingReplyCreateRequest;
import com.sportnis.api.listing.dto.ListingReplyResponse;
import com.sportnis.api.listing.dto.ListingResponse;
import com.sportnis.api.listing.dto.ListingUpdateRequest;
import com.sportnis.entity.enums.ListingType;
import com.sportnis.security.CurrentUserProvider;
import com.sportnis.service.ListingReplyService;
import com.sportnis.service.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Listings", description = "Работа с листингами")
@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {

    private final ListingService listingService;
    private final ListingReplyService listingReplyService;
    private final CurrentUserProvider currentUserProvider;

    public ListingController(
            ListingService listingService,
            ListingReplyService listingReplyService,
            CurrentUserProvider currentUserProvider
    ) {
        this.listingService = listingService;
        this.listingReplyService = listingReplyService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    @Operation(
            summary = "Создать листинг",
            description = "Создает OFFER-листинг от активного provider-профиля текущего пользователя.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingResponse createMyListing(@Valid @RequestBody ListingCreateRequest request) {
        return listingService.createMyListing(currentUserProvider.getCurrentUserId(), request);
    }

    @GetMapping("/my")
    @Operation(
            summary = "Мои листинги",
            description = "Возвращает листинги активного профиля текущего пользователя.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public List<ListingResponse> listMyListings() {
        return listingService.listMyListings(currentUserProvider.getCurrentUserId());
    }

    @GetMapping("/my/{id}")
    @Operation(
            summary = "Мой листинг по ID",
            description = "Возвращает листинг владельца по ID.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingResponse getMyListing(@PathVariable UUID id) {
        return listingService.getMyListing(currentUserProvider.getCurrentUserId(), id);
    }

    @PutMapping("/my/{id}")
    @Operation(
            summary = "Обновить мой листинг",
            description = "Обновляет листинг владельца. Разрешено только для статуса PUBLISHED.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingResponse updateMyListing(@PathVariable UUID id, @Valid @RequestBody ListingUpdateRequest request) {
        return listingService.updateMyListing(currentUserProvider.getCurrentUserId(), id, request);
    }

    @PostMapping("/my/{id}/archive")
    @Operation(
            summary = "Архивировать мой листинг",
            description = "Переводит листинг в статус ARCHIVED.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingResponse archiveMyListing(@PathVariable UUID id) {
        return listingService.archiveMyListing(currentUserProvider.getCurrentUserId(), id);
    }

    @PostMapping("/my/{id}/close")
    @Operation(
            summary = "Закрыть мой листинг",
            description = "Переводит листинг в статус CLOSED.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingResponse closeMyListing(@PathVariable UUID id) {
        return listingService.closeMyListing(currentUserProvider.getCurrentUserId(), id);
    }

    @PostMapping("/{id}/responses")
    @Operation(
            summary = "Откликнуться на листинг",
            description = "Создает отклик активного профиля на provider-листинг. Один отклик на листинг от одного профиля.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingReplyResponse createMyReply(
            @PathVariable UUID id,
            @Valid @RequestBody ListingReplyCreateRequest request
    ) {
        return listingReplyService.createMyReply(currentUserProvider.getCurrentUserId(), id, request);
    }

    @DeleteMapping("/{id}/responses/me")
    @Operation(
            summary = "Отозвать свой отклик",
            description = "Удаляет отклик активного профиля на листинг, освобождая возможность откликнуться заново. "
                    + "Нельзя отозвать уже принятый отклик.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public void withdrawMyReply(@PathVariable UUID id) {
        listingReplyService.withdrawMyReply(currentUserProvider.getCurrentUserId(), id);
    }

    @GetMapping("/my/{id}/responses")
    @Operation(
            summary = "Отклики на мой листинг",
            description = "Возвращает список откликов на листинг текущего владельца.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public List<ListingReplyResponse> listMyListingReplies(@PathVariable UUID id) {
        return listingReplyService.listMyListingReplies(currentUserProvider.getCurrentUserId(), id);
    }

    @PostMapping("/my/{listingId}/responses/{responseId}/accept")
    @Operation(
            summary = "Принять отклик",
            description = "Переводит отклик в статус ACCEPTED и открывает contactInfo откликнувшемуся профилю.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingReplyResponse acceptMyListingReply(
            @PathVariable UUID listingId,
            @PathVariable UUID responseId
    ) {
        return listingReplyService.acceptMyListingReply(currentUserProvider.getCurrentUserId(), listingId, responseId);
    }

    @PostMapping("/my/{listingId}/responses/{responseId}/reject")
    @Operation(
            summary = "Отклонить отклик",
            description = "Переводит отклик в статус REJECTED.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingReplyResponse rejectMyListingReply(
            @PathVariable UUID listingId,
            @PathVariable UUID responseId
    ) {
        return listingReplyService.rejectMyListingReply(currentUserProvider.getCurrentUserId(), listingId, responseId);
    }

    @GetMapping
    @Operation(
            summary = "Публичный каталог листингов",
            description = "Возвращает публичные листинги. Можно фильтровать по type.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public List<ListingResponse> listPublicListings(
            @RequestParam(required = false) ListingType type
    ) {
        return listingService.listPublicListings(currentUserProvider.getCurrentUserIdOrNull(), type);
    }

    @GetMapping("/responses/my")
    @Operation(
            summary = "Мои отклики",
            description = "Возвращает листинги, на которые откликнулся активный профиль, с его статусом отклика.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public List<ListingResponse> listMyReplies() {
        return listingService.listMyReplies(currentUserProvider.getCurrentUserId());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Публичный листинг по ID",
            description = "Возвращает публичный листинг в статусе PUBLISHED по ID.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ListingResponse getPublicListing(@PathVariable UUID id) {
        return listingService.getPublicListing(currentUserProvider.getCurrentUserIdOrNull(), id);
    }
}
