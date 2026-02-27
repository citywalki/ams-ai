plugins {
    id("base-java-convention")
    id("code-quality-convention")
    alias(libs.plugins.gradle.jandex)
}

dependencies {
    implementation(project(":lib-common"))
    implementation(project(":lib-persistence"))
    implementation(project(":lib-cluster"))

    implementation(enforcedPlatform(libs.quarkus.bom))

    implementation(libs.quarkus.arc)
    implementation("io.quarkus:quarkus-rest")

    // Security/JWT dependencies (previously from lib-security)
    implementation(libs.quarkus.smallrye.jwt)
    implementation(libs.quarkus.smallrye.jwt.build)
    implementation("io.quarkus:quarkus-cache")
    implementation("io.quarkus:quarkus-hibernate-orm")

    implementation(libs.quarkus.micrometer)
    implementation(libs.micrometer.core)

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)
    implementation(libs.javax.validation.api)

    implementation(libs.slf4j.api)

    testImplementation(enforcedPlatform(libs.quarkus.bom))
    testImplementation(libs.quarkus.junit5)
    testImplementation(libs.quarkus.junit5.component)
    testImplementation(libs.quarkus.junit5.mockito)
    testImplementation(libs.assertj.core)
    testImplementation(libs.junit.jupiter.api)
}

tasks.withType<Test> {
    useJUnitPlatform()
    systemProperty("java.util.logging.manager", "org.jboss.logmanager.LogManager")
}