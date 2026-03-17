package com.sportnis.repository.profile;

import com.sportnis.entity.profile.Profile;
import com.sportnis.entity.enums.ProfileType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByIdAndUser_Id(UUID profileId, UUID userId);

    Optional<Profile> findFirstByUser_IdOrderByCreatedAtAsc(UUID userId);

    List<Profile> findAllByUser_IdOrderByCreatedAtAsc(UUID userId);

    List<Profile> findAllByIsPublicTrueOrderByCreatedAtDesc();

    List<Profile> findAllByIsPublicTrueAndProfileTypeAndIsLookingForTrueOrderByCreatedAtDesc(ProfileType profileType);

    long countByUser_Id(UUID userId);
}
