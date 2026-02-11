plugins {
    id("base-java-convention")
    id("code-quality-convention")
    alias(libs.plugins.gradle.jandex)
}

dependencies {
    implementation(project(":lib-common"))
    implementation(project(":lib-cluster"))
    implementation(project(":lib-persistence"))

    implementation(enforcedPlatform(libs.quarkus.bom))

    implementation(libs.quarkus.arc)
    implementation("io.quarkus:quarkus-rest")
    implementation(libs.quarkus.config.yaml)

    implementation(libs.bundles.ingestion.tools)

    implementation(libs.hazelcast)

    implementation(libs.quarkus.micrometer)
    implementation(libs.micrometer.core)

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)

    implementation(libs.slf4j.api)
}
