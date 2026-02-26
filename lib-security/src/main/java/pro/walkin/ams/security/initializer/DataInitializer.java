package pro.walkin.ams.security.initializer;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class DataInitializer {
    protected final Logger log = LoggerFactory.getLogger(getClass());

    @Transactional
    public abstract void initialize();
}
