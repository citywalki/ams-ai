package pro.walkin.ams.ingestion.connector;

/** 所有协议接入的统一抽象接口 */
public interface IngestionConnector {
  String getSourceId(); // 来源 ID (如: prometheus-k8s, system-a-mq)

  String getProtocol(); // 协议类型 (如: HTTP, RABBITMQ, KAFKA)

  void start(); // 激活监听

  void stop(); // 停止监听

  boolean isRunning(); // 当前状态
}
