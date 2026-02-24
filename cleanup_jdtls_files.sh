#!/bin/bash

# 清理项目中因jdtls产生的多余文件和bin文件夹
# 脚本功能：
# 1. 删除所有Eclipse/JDT配置文件 (.project, .classpath, .settings, .factorypath)
# 2. 删除所有IntelliJ IDEA配置文件 (.idea)
# 3. 删除所有Java编译输出目录 (bin)
# 4. 验证删除结果

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查当前目录是否为项目根目录
check_project_root() {
    if [ ! -f "build.gradle.kts" ] && [ ! -f "build.gradle" ]; then
        print_message $RED "错误: 请在项目根目录下运行此脚本"
        exit 1
    fi
    print_message $GREEN "✓ 确认在项目根目录下运行"
}

# 删除Eclipse/JDT配置文件
delete_eclipse_files() {
    print_message $YELLOW "开始删除Eclipse/JDT配置文件..."
    
    local eclipse_files=()
    
    # 查找所有 .project 文件
    while IFS= read -r -d '' file; do
        eclipse_files+=("$file")
    done < <(find . -name ".project" -type f -print0 2>/dev/null)
    
    # 查找所有 .classpath 文件
    while IFS= read -r -d '' file; do
        eclipse_files+=("$file")
    done < <(find . -name ".classpath" -type f -print0 2>/dev/null)
    
    # 查找所有 .settings 目录
    while IFS= read -r -d '' dir; do
        eclipse_files+=("$dir")
    done < <(find . -name ".settings" -type d -print0 2>/dev/null)
    
    # 查找所有 .factorypath 文件
    while IFS= read -r -d '' file; do
        eclipse_files+=("$file")
    done < <(find . -name ".factorypath" -type f -print0 2>/dev/null)
    
    if [ ${#eclipse_files[@]} -eq 0 ]; then
        print_message $GREEN "✓ 未找到Eclipse/JDT配置文件"
    else
        print_message $YELLOW "找到 ${#eclipse_files[@]} 个Eclipse/JDT配置文件:"
        for file in "${eclipse_files[@]}"; do
            echo "  - $file"
        done
        
        # 删除文件
        for file in "${eclipse_files[@]}"; do
            if rm -rf "$file" 2>/dev/null; then
                print_message $GREEN "✓ 已删除: $file"
            else
                print_message $RED "✗ 删除失败: $file"
            fi
        done
    fi
}

# 删除IntelliJ IDEA配置文件
delete_intellij_files() {
    print_message $YELLOW "开始删除IntelliJ IDEA配置文件..."
    
    local intellij_dirs=()
    
    # 查找所有 .idea 目录
    while IFS= read -r -d '' dir; do
        intellij_dirs+=("$dir")
    done < <(find . -name ".idea" -type d -print0 2>/dev/null)
    
    if [ ${#intellij_dirs[@]} -eq 0 ]; then
        print_message $GREEN "✓ 未找到IntelliJ IDEA配置文件"
    else
        print_message $YELLOW "找到 ${#intellij_dirs[@]} 个IntelliJ IDEA配置目录:"
        for dir in "${intellij_dirs[@]}"; do
            echo "  - $dir"
        done
        
        # 删除目录
        for dir in "${intellij_dirs[@]}"; do
            if rm -rf "$dir" 2>/dev/null; then
                print_message $GREEN "✓ 已删除: $dir"
            else
                print_message $RED "✗ 删除失败: $dir"
            fi
        done
    fi
}

# 删除Java编译输出目录 (bin)
delete_bin_directories() {
    print_message $YELLOW "开始删除Java编译输出目录..."
    
    local bin_dirs=()
    
    # 查找所有 bin 目录（排除node_modules中的）
    while IFS= read -r -d '' dir; do
        if [[ "$dir" != *"node_modules"* ]]; then
            bin_dirs+=("$dir")
        fi
    done < <(find . -name "bin" -type d -print0 2>/dev/null)
    
    if [ ${#bin_dirs[@]} -eq 0 ]; then
        print_message $GREEN "✓ 未找到Java编译输出目录"
    else
        print_message $YELLOW "找到 ${#bin_dirs[@]} 个Java编译输出目录:"
        for dir in "${bin_dirs[@]}"; do
            echo "  - $dir"
        done
        
        # 删除目录
        for dir in "${bin_dirs[@]}"; do
            if rm -rf "$dir" 2>/dev/null; then
                print_message $GREEN "✓ 已删除: $dir"
            else
                print_message $RED "✗ 删除失败: $dir"
            fi
        done
    fi
}

# 验证删除结果
verify_cleanup() {
    print_message $YELLOW "开始验证清理结果..."
    
    local remaining_files=0
    
    # 检查Eclipse/JDT文件
    local eclipse_count=$(find . -name ".project" -o -name ".classpath" -o -name ".settings" -o -name ".factorypath" | wc -l)
    if [ "$eclipse_count" -gt 0 ]; then
        print_message $RED "✗ 发现残留的Eclipse/JDT配置文件: $eclipse_count 个"
        remaining_files=$((remaining_files + eclipse_count))
    else
        print_message $GREEN "✓ 未发现残留的Eclipse/JDT配置文件"
    fi
    
    # 检查IntelliJ文件
    local intellij_count=$(find . -name ".idea" | wc -l)
    if [ "$intellij_count" -gt 0 ]; then
        print_message $RED "✗ 发现残留的IntelliJ配置目录: $intellij_count 个"
        remaining_files=$((remaining_files + intellij_count))
    else
        print_message $GREEN "✓ 未发现残留的IntelliJ配置目录"
    fi
    
    # 检查bin目录（排除node_modules）
    local bin_count=$(find . -name "bin" -type d | grep -v node_modules | wc -l)
    if [ "$bin_count" -gt 0 ]; then
        print_message $RED "✗ 发现残留的Java编译输出目录: $bin_count 个"
        remaining_files=$((remaining_files + bin_count))
    else
        print_message $GREEN "✓ 未发现残留的Java编译输出目录"
    fi
    
    if [ $remaining_files -eq 0 ]; then
        print_message $GREEN "✓ 清理验证通过：所有目标文件已删除"
        return 0
    else
        print_message $RED "✗ 清理验证失败：发现 $remaining_files 个残留文件"
        return 1
    fi
}

# 显示清理建议
show_suggestions() {
    print_message $BLUE "\n清理建议："
    echo "1. 建议将以下内容添加到 .gitignore 文件中："
    echo "   # IDE配置文件"
    echo "   .project"
    echo "   .classpath"
    echo "   .settings/"
    echo "   .factorypath"
    echo "   .idea/"
    echo ""
    echo "   # 编译产物"
    echo "   bin/"
    echo "   build/"
    echo "   target/"
    echo "   out/"
    echo ""
    echo "2. 运行 './gradlew clean' 来清理Gradle构建产物"
    echo "3. 运行 './gradlew build' 重新生成必要的构建文件"
}

# 主函数
main() {
    print_message $BLUE "开始清理项目中的jdtls产生的多余文件..."
    echo ""
    
    # 检查项目根目录
    check_project_root
    echo ""
    
    # 执行清理操作
    delete_eclipse_files
    echo ""
    
    delete_intellij_files
    echo ""
    
    delete_bin_directories
    echo ""
    
    # 验证结果
    if verify_cleanup; then
        echo ""
        print_message $GREEN "🎉 清理完成！"
        show_suggestions
        exit 0
    else
        echo ""
        print_message $RED "❌ 清理未完全完成，请检查上述错误信息"
        exit 1
    fi
}

# 运行主函数
main "$@"