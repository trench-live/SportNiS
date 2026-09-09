package com.sportnis.api.feed;

import com.sportnis.api.feed.dto.FeedResponse;
import com.sportnis.security.CurrentUserProvider;
import com.sportnis.service.FeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Feed", description = "Сценарная лента для гостя, consumer и provider")
@RestController
@RequestMapping("/api/v1/feed")
public class FeedController {

    private final FeedService feedService;
    private final CurrentUserProvider currentUserProvider;

    public FeedController(FeedService feedService, CurrentUserProvider currentUserProvider) {
        this.feedService = feedService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    @Operation(
            summary = "Получить ленту",
            description = "Гость получает смешанную ленту, consumer получает provider-листинги, provider получает анкеты consumer в поиске.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public FeedResponse getFeed(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String tag
    ) {
        return feedService.getFeed(currentUserProvider.getCurrentUserIdOrNull(), page, size, city, tag);
    }
}
