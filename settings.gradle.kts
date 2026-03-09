dependencyResolutionManagement {
    // Use Maven Central as the default repository (where Gradle will download dependencies) in all subprojects.
    @Suppress("UnstableApiUsage")
    repositories {
        // 本地 Maven 仓库（用于 tower-messaging 等本地模块）
        mavenLocal()
        maven {
            url = uri("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/")
        }
        maven("https://maven.aliyun.com/repository/central")
        mavenCentral()
//        maven {
//            url = uri("https://s01.oss.sonatype.org/content/repositories/snapshots/")
//        }
    }
}


rootProject.name = "ams-ai"

// 启用功能预览
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

// 模块定义
include(
    "lib-common",
    "lib-persistence",
    "lib-cluster",

    "feature-core",
    "feature-admin",
    "feature-alert-ingestion",
    "feature-graphql",

    "app-boot"
)