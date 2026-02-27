package pro.walkin.ams.boot.initializer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class DataInitializer {
  protected final Logger log = LoggerFactory.getLogger(getClass());

  public abstract void initialize();
}
