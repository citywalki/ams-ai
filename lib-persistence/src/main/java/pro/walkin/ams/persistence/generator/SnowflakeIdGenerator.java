package pro.walkin.ams.persistence.generator;

import java.io.Serializable;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import pro.walkin.ams.common.util.IdWorker;

/**
 * Snowflake ID 生成器实现，符合 Hibernate 6.5+ 标准 生成分布式的唯一 ID，适用于高并发场景 结构: 时间戳(41位) + 数据中心ID(5位) + 机器ID(5位)
 * + 序列号(12位)
 */
public class SnowflakeIdGenerator implements IdentifierGenerator {

  private final IdWorker idWorker;

  public SnowflakeIdGenerator() {
    this(getWorkId());
  }

  public SnowflakeIdGenerator(long datacenterId) {
    this.idWorker = new IdWorker(datacenterId);
  }

  @Override
  public Serializable generate(SharedSessionContractImplementor session, Object object) {
    return idWorker.nextId();
  }

  /** 获取机器ID */
  private static long getWorkId() {
    try {
      String hostAddress = java.net.InetAddress.getLocalHost().getHostAddress();
      int hash = java.util.Objects.hash(hostAddress);
      int mod = hash >= 0 ? hash : -hash;
      return mod % 32;
    } catch (Exception e) {
      // 异常返回随机数
      return java.util.concurrent.ThreadLocalRandom.current().nextInt(0, 31);
    }
  }
}
