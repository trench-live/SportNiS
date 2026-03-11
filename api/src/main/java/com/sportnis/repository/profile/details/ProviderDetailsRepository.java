package com.sportnis.repository.profile.details;

import com.sportnis.entity.profile.details.ProviderDetails;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderDetailsRepository extends JpaRepository<ProviderDetails, UUID> {
}

