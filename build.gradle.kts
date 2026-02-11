plugins {
    // 应用 common-conventions 插件到所有子项目
}

// 配置所有子项目
subprojects {
    // 应用插件和配置将在各个子项目的 build.gradle.kts 中定义
}

// 创建全局SpotBugs报告聚合任务
tasks.register("spotbugsAll") {
    group = "verification"
    description = "Run SpotBugs for all modules and generate aggregate report"
    
    dependsOn(subprojects.mapNotNull { subproject ->
        // 只依赖有 spotbugsMain 任务的子项目
        subproject.tasks.findByName("spotbugsMain")?.path
    })
    
    doLast {
        println("SpotBugs analysis completed for all modules")
        println("Aggregate report location: build/reports/spotbugs/aggregate.html")
    }
}
