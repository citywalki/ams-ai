package pro.walkin.ams.persistence.generator;

import java.io.Serializable;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

/**
 * 租户感知的 ID 生成器
 * 适用于多租户环境，确保 ID 在租户内唯一
 */
public class TenantAwareIdGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // 生成基于时间和租户的唯一 ID
        // 这是一个简化的示例，实际实现可能会更复杂
        long timestamp = System.currentTimeMillis();
        
        // 在实际应用中，可以从租户上下文获取租户 ID
        // 并将其编码到 ID 中以确保跨租户的唯一性
        String tenantId = getCurrentTenantId(session);
        
        // 简单组合时间戳和租户信息生成唯一 ID
        // 在实际应用中，可能需要更复杂的算法来确保唯一性和性能
        long baseId = timestamp;
        
        // 添加租户信息作为后缀或使用雪花算法等
        // 这里简单使用哈希的一部分来演示概念
        long tenantHash = Math.abs(tenantId.hashCode()) % 10000; // 简单哈希
        long combinedId = baseId + tenantHash;
        
        return combinedId;
    }

    /**
     * 获取当前会话的租户 ID
     */
    private String getCurrentTenantId(SharedSessionContractImplementor session) {
        // 实际实现应该从租户解析器或上下文中获取租户 ID
        // 这是一个示例实现
        return "default_tenant";
    }
}