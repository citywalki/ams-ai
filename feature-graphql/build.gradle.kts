plugins {
    id("base-java-convention")
    id("code-quality-convention")
    alias(libs.plugins.gradle.jandex)
}

dependencies {
    implementation(project(":lib-common"))
    implementation(project(":lib-persistence"))

    implementation(enforcedPlatform(libs.quarkus.bom))

    implementation(libs.quarkus.arc)
    implementation("io.quarkus:quarkus-smallrye-graphql")
    implementation("io.quarkus:quarkus-hibernate-orm")

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)
    implementation("jakarta.transaction:jakarta.transaction-api:2.0.1")

    implementation(libs.slf4j.api)

    testImplementation(enforcedPlatform(libs.quarkus.bom))
    testImplementation(libs.quarkus.junit5)
    testImplementation(libs.assertj.core)
    testImplementation(libs.junit.jupiter.api)
}

tasks.withType<Test> {
    useJUnitPlatform()
    systemProperty("java.util.logging.manager", "org.jboss.logmanager.LogManager")
}
