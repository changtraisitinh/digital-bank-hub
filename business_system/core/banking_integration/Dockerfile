FROM eclipse-temurin:21-jdk

ARG SERVICE_NAME
LABEL group=dibank
LABEL service=$SERVICE_NAME

WORKDIR /app
COPY build/libs/*.jar app.jar

EXPOSE 8103
ENTRYPOINT ["java", "-jar", "app.jar"]