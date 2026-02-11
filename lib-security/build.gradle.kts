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
    implementation(libs.quarkus.rest)

    implementation(libs.jackson.module.kotlin)
    implementation(libs.jackson.datatype.jsr310)

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)
    implementation(libs.javax.validation.api)

    implementation(libs.slf4j.api)

    implementation(libs.quarkus.smallrye.jwt)
    implementation(libs.quarkus.smallrye.jwt.build)
    implementation(libs.quarkus.elytron.security.common)

    implementation("io.quarkus:quarkus-cache")
    implementation("io.quarkus:quarkus-hibernate-panache-next")
}
