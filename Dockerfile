FROM maven:3.9.16-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/target/order-api-0.0.1-SNAPSHOT.jar /app/app.jar
USER 10001:10001

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
