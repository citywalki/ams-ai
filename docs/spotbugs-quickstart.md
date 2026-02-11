# SpotBugs Quick Start Guide

## Overview
SpotBugs is a static code analysis tool for detecting potential bugs and code quality issues in Java code. This project has integrated SpotBugs 6.4.8.

## Quick Start

### Run basic analysis
```bash
./gradlew spotbugsMain
```

### Analyze specific module
```bash
./gradlew :lib-common:spotbugsMain
./gradlew :feature-core:spotbugsMain
```

### Analyze all modules
```bash
./gradlew spotbugsAll
```

### View reports
```bash
open lib-common/build/reports/spotbugs/spotbugsMain.html
```

### Run full checks (including SpotBugs)
```bash
./gradlew check
```

## Common Issues

### Skip SpotBugs checks (development only)
```bash
./gradlew build -x spotbugsMain
```

### Ignore specific warnings
1. Add exclusion rules to `config/spotbugs/exclude.xml`
2. Refer to examples in `config/spotbugs/exclude.xml`

### SpotBugs fails causing build failure
Check `build/reports/spotbugs/spotbugsMain.html` for specific issues, then:
- Fix code issues
- Or add reasonable exclusion rules in `exclude.xml`

## Bug Patterns Reference

Common bug patterns:
- **NP**: Null Pointer Dereference
- **RC**: Resource Leaks
- **SE**: Serializable Issues
- **EI**: Exposure of Internal Representation
- **UR**: Uninitialized Read

See: https://spotbugs.github.io/

## CI/CD Integration

SpotBugs tasks are integrated into `check` task, CI/CD pipeline will automatically execute.

## Configuration

- **Config file**: `config/spotbugs/exclude.xml`
- **Plugin definition**: `buildSrc/src/main/kotlin/code-quality-convention.gradle.kts`
- **Report location**: `各模块/build/reports/spotbugs/`
