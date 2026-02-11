repositories {
    mavenCentral()
    gradlePluginPortal()
}

plugins {
    `kotlin-dsl`
}

// 预编译脚本插件需要显式声明依赖
dependencies {
    implementation("com.github.spotbugs:com.github.spotbugs.gradle.plugin:6.4.8")
}
