FROM eclipse-temurin:21-jdk

ARG SERVICE_NAME
LABEL group=dibank
LABEL service=$SERVICE_NAME

WORKDIR /app
COPY build/libs/*.jar app.jar
COPY deployment/local/application-k8s.yml application-k8s.yml
EXPOSE 8004
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=file:./application-k8s.yml"]