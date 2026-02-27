plugins {
    id("com.diffplug.spotless")
}

spotless {
    java {
        target("**/*.java")
        targetExclude("**/bin/**")
        googleJavaFormat("1.25.2")
        importOrder("", "javax", "java", "\\#")
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
}

tasks.named("spotlessCheck") {
    group = "verification"
    description = "Verifies that all Java files are formatted according to Google Java Style"
}
