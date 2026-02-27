plugins {
    id("base-java-convention")
    id("code-quality-convention")
}

tasks.withType<Jar> {
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

dependencies {
    // Quarkus BOM
    implementation(enforcedPlatform(libs.quarkus.bom))

    // Quarkus 核心
    implementation(libs.quarkus.arc)
    implementation(libs.quarkus.rest)
    implementation(libs.quarkus.rest.jackson)

    // Security filters dependencies
    implementation("io.quarkus:quarkus-hibernate-orm")
    implementation(libs.quarkus.smallrye.jwt)

    // Jackson (JSON处理)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.jackson.datatype.jsr310)

    // 工具类
    implementation(libs.jakarta.inject.api)
    implementation(libs.jakarta.annotation.api)
    implementation(libs.javax.validation.api)

    // 日志
    implementation(libs.slf4j.api)
}
