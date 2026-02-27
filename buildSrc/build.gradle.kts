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
    implementation("com.diffplug.spotless:com.diffplug.spotless.gradle.plugin:7.0.2")
}
