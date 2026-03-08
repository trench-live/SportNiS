package com.sportnis.repository.profile;

import com.sportnis.entity.profile.Profile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUser_Id(UUID userId);
}

