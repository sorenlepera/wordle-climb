# Stage 1: Build the Angular frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Quarkus backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
# Download dependencies first to cache them
RUN mvn dependency:go-offline || true
COPY backend/src ./src
# Copy the compiled frontend into Quarkus resources so it's served by Quarkus
COPY --from=frontend-builder /app/frontend/dist/frontend/browser ./src/main/resources/META-INF/resources
# Build the application
RUN mvn package -DskipTests

# Stage 3: Create the final lightweight runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /work

# Copy the Quarkus fast-jar application structure
COPY --from=backend-builder /app/backend/target/quarkus-app/lib/ /work/lib/
COPY --from=backend-builder /app/backend/target/quarkus-app/*.jar /work/
COPY --from=backend-builder /app/backend/target/quarkus-app/app/ /work/app/
COPY --from=backend-builder /app/backend/target/quarkus-app/quarkus/ /work/quarkus/

# Create a directory for SSL keys and database if needed
RUN mkdir -p /work/keys /work/db

EXPOSE 8080
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

# Start the application
CMD ["java", "-jar", "quarkus-run.jar"]
