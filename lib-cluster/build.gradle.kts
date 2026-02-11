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

    api(libs.hazelcast)

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)

    implementation(libs.slf4j.api)
    implementation("io.quarkus:quarkus-cache")
}
