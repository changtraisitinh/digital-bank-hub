package com.hiepnh.auth_service.adapter.out;

import com.hiepnh.auth_service.domain.model.User;
import com.hiepnh.auth_service.domain.repository.UserRepository;
import com.hiepnh.auth_service.infrastructure.persistence.entity.UserEntity;
import com.hiepnh.auth_service.infrastructure.persistence.mapper.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {
    private final UserJpaRepository jpaRepository;
    private final EntityMapper mapper;

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email)
                .map(mapper::toUser);
    }

    @Override
    public User save(User user) {
        UserEntity entity = mapper.toUserEntity(user);
        return mapper.toUser(jpaRepository.save(entity));
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toUser);
    }
}

@Repository
interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);
}