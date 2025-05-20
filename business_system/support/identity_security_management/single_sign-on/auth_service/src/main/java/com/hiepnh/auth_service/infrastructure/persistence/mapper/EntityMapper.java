package com.hiepnh.auth_service.infrastructure.persistence.mapper;

import com.hiepnh.auth_service.domain.model.MfaMethod;
import com.hiepnh.auth_service.domain.model.Session;
import com.hiepnh.auth_service.domain.model.User;
import com.hiepnh.auth_service.infrastructure.persistence.entity.MfaMethodEntity;
import com.hiepnh.auth_service.infrastructure.persistence.entity.SessionEntity;
import com.hiepnh.auth_service.infrastructure.persistence.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntityMapper {
    @Mapping(target = "createdAt", expression = "java(mfaMethod.getCreatedAt() != null ? mfaMethod.getCreatedAt() : java.time.LocalDateTime.now())")
    MfaMethodEntity toMfaMethodEntity(MfaMethod mfaMethod);

    MfaMethod toMfaMethod(MfaMethodEntity entity);

    @Mapping(target = "createdAt", expression = "java(session.getCreatedAt() != null ? session.getCreatedAt() : java.time.LocalDateTime.now())")
    SessionEntity toSessionEntity(Session session);

    Session toSession(SessionEntity entity);

    @Mapping(target = "createdAt", expression = "java(user.getCreatedAt() != null ? user.getCreatedAt() : java.time.LocalDateTime.now())")
    UserEntity toUserEntity(User user);

    User toUser(UserEntity entity);
}