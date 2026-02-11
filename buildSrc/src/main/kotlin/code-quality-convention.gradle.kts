import com.github.spotbugs.snom.Effort
import com.github.spotbugs.snom.Confidence

plugins {
    id("base-java-convention")
    id("com.github.spotbugs")
}

// Configure SpotBugs global settings
spotbugs {
    // Don't fail build if bugs are found (generate report instead)
    ignoreFailures.set(true)
    
    // Maximum analysis effort
    effort.set(Effort.MAX)
    
    // Report confidence level: report all bugs
    reportLevel.set(Confidence.LOW)
    
    // Show analysis progress
    showProgress.set(true)
    
    // Configure heap size via gradle property or use default
    maxHeapSize.set(providers.gradleProperty("spotbugs.maxHeapSize").getOrElse("2g"))
}

// Configure SpotBugs tasks
tasks.withType<com.github.spotbugs.snom.SpotBugsTask>().configureEach {
    // Set exclude filter file (configurable via gradle property)
    val excludeFilePath = providers.gradleProperty("spotbugs.excludeFile")
        .map { rootProject.layout.projectDirectory.file(it) }
        .getOrElse(rootProject.layout.projectDirectory.file("config/spotbugs/exclude.xml"))
    
    if (excludeFilePath.asFile.exists()) {
        excludeFilter.set(excludeFilePath)
    }
    
    // Configure HTML report
    reports.create("html") {
        required.set(true)
        outputLocation.set(layout.buildDirectory.file("reports/spotbugs/${name}.html"))
        setStylesheet("fancy-hist.xsl")
    }
    
    // Configure XML report
    reports.create("xml") {
        required.set(true)
        outputLocation.set(layout.buildDirectory.file("reports/spotbugs/${name}.xml"))
    }
}

// Ensure check task depends on SpotBugs tasks
tasks.named("check") {
    dependsOn(tasks.withType<com.github.spotbugs.snom.SpotBugsTask>())
}

// Create aggregated SpotBugs report task
tasks.register<com.github.spotbugs.snom.SpotBugsTask>("spotbugsAll") {
    group = "verification"
    description = "Run SpotBugs for all source sets and aggregate reports"
    
    // Collect all SpotBugs reports from subprojects
    val subprojectReports = project.subprojects.map { subproject ->
        subproject.tasks.withType<com.github.spotbugs.snom.SpotBugsTask>()
            .map { task -> task.reports["xml"].outputLocation.get().asFile }
    }.flatten()
    
    // Configure aggregated report (use existing reports)
    reports.maybeCreate("html").apply {
        required.set(true)
        outputLocation.set(layout.buildDirectory.file("reports/spotbugs/aggregate.html"))
        setStylesheet("fancy-hist.xsl")
    }
}