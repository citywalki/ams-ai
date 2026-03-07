plugins {
    `java-library`
    id("google-java-format-convention")
}

group = "pro.walkin.ams"
version = "1.0.0-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
    withSourcesJar()
//    withJavadocJar()
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    sourceCompatibility = JavaVersion.VERSION_21.toString()
    targetCompatibility = JavaVersion.VERSION_21.toString()
}

// Configure Mockito agent for all test tasks to avoid JDK agent loading restrictions
tasks.withType<Test> {
    doFirst {
        val mockitoAgent = classpath.find { 
            it.name.startsWith("mockito-core") && it.name.endsWith(".jar") 
        }
        if (mockitoAgent != null && !jvmArgs!!.contains("-javaagent:")) {
            jvmArgs("-javaagent:${mockitoAgent.absolutePath}")
        }
    }
}