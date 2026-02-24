#!/bin/bash

# 快速清理脚本：删除jdtls产生的多余文件和bin文件夹
# 简化版本，适合快速执行

echo "🚀 开始快速清理项目中的jdtls产生的多余文件..."

# 检查是否在项目根目录
if [ ! -f "build.gradle.kts" ] && [ ! -f "build.gradle" ]; then
    echo "❌ 错误: 请在项目根目录下运行此脚本"
    exit 1
fi

echo "✓ 确认在项目根目录下运行"

# 删除Eclipse/JDT配置文件
echo "🔍 删除Eclipse/JDT配置文件..."
find . -name ".project" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name ".classpath" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name ".settings" -type d -exec rm -rf {} \; 2>/dev/null || true
find . -name ".factorypath" -type f -exec rm -f {} \; 2>/dev/null || true
echo "✓ Eclipse/JDT配置文件已清理"

# 删除IntelliJ IDEA配置文件
echo "🔍 删除IntelliJ IDEA配置文件..."
find . -name ".idea" -type d -exec rm -rf {} \; 2>/dev/null || true
echo "✓ IntelliJ IDEA配置文件已清理"

# 删除Java编译输出目录 (bin)
echo "🔍 删除Java编译输出目录..."
find . -name "bin" -type d | grep -v node_modules | xargs rm -rf 2>/dev/null || true
echo "✓ Java编译输出目录已清理"

# 验证清理结果
echo "🔍 验证清理结果..."
remaining=$(find . -name ".project" -o -name ".classpath" -o -name ".settings" -o -name ".factorypath" -o -name ".idea" | grep -v node_modules | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo ""
    echo "🎉 清理完成！"
    echo ""
    echo "💡 建议：将以下内容添加到 .gitignore 文件中："
    echo "   .project"
    echo "   .classpath"
    echo "   .settings/"
    echo "   .factorypath"
    echo "   .idea/"
    echo "   bin/"
    echo "   build/"
    echo "   target/"
    echo "   out/"
    echo ""
    echo "🔧 可选命令："
    echo "   ./gradlew clean  # 清理Gradle构建产物"
    echo "   ./gradlew build  # 重新生成构建文件"
    exit 0
else
    echo ""
    echo "⚠️  发现 $remaining 个残留文件"
    exit 1
fi