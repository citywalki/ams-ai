plugins {
    id("base-java-convention")
    id("code-quality-convention")
    alias(libs.plugins.gradle.jandex)
}

dependencies {
    implementation(project(":lib-common"))

    implementation(enforcedPlatform(libs.quarkus.bom))
    annotationProcessor(enforcedPlatform(libs.quarkus.bom))

    annotationProcessor("org.hibernate.orm:hibernate-processor")
    api("io.quarkus:quarkus-hibernate-panache-next")
    api("io.quarkus:quarkus-hibernate-envers")
    implementation("io.quarkus:quarkus-jackson")
}
