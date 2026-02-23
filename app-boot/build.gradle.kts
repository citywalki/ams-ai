plugins {
    id("base-java-convention")
    id("code-quality-convention")
    alias(libs.plugins.quarkus)
}

dependencies {
    implementation(project(":lib-common"))
    implementation(project(":lib-cluster"))
    api(project(":feature-core"))
    api(project(":feature-admin"))
    api(project(":feature-alert-ingestion"))

    implementation(enforcedPlatform(libs.quarkus.bom))

    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-rest")
    implementation("io.quarkus:quarkus-rest-jackson")
    implementation("io.quarkus:quarkus-config-yaml")

    api("net.javacrumbs.shedlock:shedlock-cdi:7.6.0")
    implementation("net.javacrumbs.shedlock:shedlock-provider-jdbc-template:7.6.0")
    implementation("io.quarkus:quarkus-jdbc-postgresql")

    implementation(libs.hazelcast)

    implementation(libs.quarkus.liquibase)

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)
    implementation(libs.javax.validation.api)
    implementation(libs.jakarta.persistence.api)

    implementation("io.quarkus:quarkus-micrometer")
    implementation("io.quarkus:quarkus-micrometer-registry-prometheus")
    implementation("io.quarkus:quarkus-jackson")
    implementation("io.quarkus:quarkus-smallrye-openapi")

    testImplementation(enforcedPlatform(libs.quarkus.bom))
    testImplementation(libs.quarkus.junit5)
    testImplementation(libs.quarkus.junit5.component)
    testImplementation(libs.quarkus.junit5.mockito)
    testImplementation(libs.assertj.core)
    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.testcontainers)
    testImplementation(libs.testcontainers.postgresql)
}

tasks.withType<Test> {
    useJUnitPlatform()
    systemProperty("java.util.logging.manager", "org.jboss.logmanager.LogManager")
    if (System.getenv("DOCKER_HOST") == null && !project.hasProperty("runIntegrationTests")) {
        exclude("**/it/**")
    }
}


