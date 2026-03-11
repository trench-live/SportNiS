package com.sportnis.repository.profile.details;

import com.sportnis.entity.profile.details.ConsumerDetails;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsumerDetailsRepository extends JpaRepository<ConsumerDetails, UUID> {
}

