plugins {
    id("base-java-convention")
    id("code-quality-convention")
    alias(libs.plugins.gradle.jandex)
}

dependencies {
    implementation(project(":lib-common"))
    implementation(project(":lib-persistence"))
    implementation(project(":lib-security"))
    implementation(project(":lib-cluster"))

    implementation(enforcedPlatform(libs.quarkus.bom))

    implementation(libs.quarkus.arc)
    implementation("io.quarkus:quarkus-rest")
    implementation("io.quarkus:quarkus-scheduler")
    implementation("net.javacrumbs.shedlock:shedlock-cdi:7.6.0")

    implementation(libs.hazelcast)

    implementation(libs.quarkus.micrometer)
    implementation(libs.micrometer.core)

    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)

    implementation(libs.slf4j.api)
}