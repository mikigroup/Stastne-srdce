/**
 * Circuit Breaker Pattern pro Fakturoid API
 * Chrání aplikaci před kaskádovými selháními při problémech s externí službou
 */

export enum CircuitState {
  CLOSED = 'closed',     // Vše funguje normálně
  OPEN = 'open',         // Příliš mnoho chyb - circuit je otevřený
  HALF_OPEN = 'half_open' // Testování, zda služba funguje znovu
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Počet selhání před otevřením
  recoveryTimeout: number;     // Čas do dalšího pokusu (ms)
  monitoringPeriod: number;    // Období pro sledování chyb (ms)
  halfOpenMaxCalls: number;    // Max volání v half-open stavu
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  totalCalls: number;
  rejectedCalls: number;
}

class FakturoidCircuitBreaker {
  private config: CircuitBreakerConfig;
  private metrics: CircuitBreakerMetrics;
  private halfOpenCalls = 0;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minuta
      monitoringPeriod: 300000, // 5 minut
      halfOpenMaxCalls: 3,
      ...config
    };

    this.metrics = {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      totalCalls: 0,
      rejectedCalls: 0
    };
  }

  /**
   * Vykoná operaci s ochranou circuit breaker
   */
  async execute<T>(operation: () => Promise<T>, operationName = 'unknown'): Promise<T> {
    this.metrics.totalCalls++;

    if (!this.canExecute()) {
      this.metrics.rejectedCalls++;
      console.warn(`🚫 Circuit breaker rejected ${operationName}: state=${this.metrics.state}`);
      throw new Error('Circuit breaker is open - Fakturoid temporarily unavailable');
    }

    try {
      console.log(`🔄 Executing ${operationName} via circuit breaker (state: ${this.metrics.state})`);
      const result = await operation();
      this.onSuccess(operationName);
      return result;
    } catch (error) {
      this.onFailure(operationName, error);
      throw error;
    }
  }

  /**
   * Kontroluje, zda lze operaci vykonat
   */
  private canExecute(): boolean {
    const now = Date.now();

    switch (this.metrics.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        // Zkontroluje, zda uplynul recovery timeout
        if (now - this.metrics.lastFailureTime >= this.config.recoveryTimeout) {
          console.log('🔄 Circuit breaker moving to HALF_OPEN state');
          this.metrics.state = CircuitState.HALF_OPEN;
          this.halfOpenCalls = 0;
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        return this.halfOpenCalls < this.config.halfOpenMaxCalls;

      default:
        return false;
    }
  }

  /**
   * Zpracuje úspěšnou operaci
   */
  private onSuccess(operationName: string): void {
    this.metrics.successes++;
    this.metrics.lastSuccessTime = Date.now();

    console.log(`✅ Circuit breaker success: ${operationName}`);

    if (this.metrics.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
      
      // Pokud máme dostatek úspěšných volání, zavřeme circuit
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        console.log('✅ Circuit breaker moving to CLOSED state - service recovered');
        this.metrics.state = CircuitState.CLOSED;
        this.metrics.failures = 0;
        this.halfOpenCalls = 0;
      }
    } else if (this.metrics.state === CircuitState.CLOSED) {
      // V CLOSED stavu resetujeme failures při úspěchu
      this.metrics.failures = 0;
    }
  }

  /**
   * Zpracuje neúspěšnou operaci
   */
  private onFailure(operationName: string, error: any): void {
    this.metrics.failures++;
    this.metrics.lastFailureTime = Date.now();

    console.error(`❌ Circuit breaker failure: ${operationName}`, error?.message || error);

    if (this.metrics.state === CircuitState.HALF_OPEN) {
      // V half-open stavu jakákoliv chyba otevře circuit znovu
      console.log('🚫 Circuit breaker moving to OPEN state - half-open test failed');
      this.metrics.state = CircuitState.OPEN;
      this.halfOpenCalls = 0;
    } else if (this.metrics.state === CircuitState.CLOSED) {
      // V closed stavu otevřeme circuit při dosažení threshold
      if (this.metrics.failures >= this.config.failureThreshold) {
        console.log(`🚫 Circuit breaker moving to OPEN state - threshold reached (${this.metrics.failures}/${this.config.failureThreshold})`);
        this.metrics.state = CircuitState.OPEN;
      }
    }
  }

  /**
   * Vrací aktuální metriky
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  /**
   * Resetuje circuit breaker do počátečního stavu
   */
  reset(): void {
    console.log('🔄 Circuit breaker manually reset');
    this.metrics = {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      totalCalls: 0,
      rejectedCalls: 0
    };
    this.halfOpenCalls = 0;
  }

  /**
   * Vynuceně otevře circuit (pro testování nebo emergency)
   */
  forceOpen(): void {
    console.log('🚫 Circuit breaker forcefully opened');
    this.metrics.state = CircuitState.OPEN;
    this.metrics.lastFailureTime = Date.now();
  }
}

// Singleton instance pro Fakturoid
export const fakturoidCircuitBreaker = new FakturoidCircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minuta
  monitoringPeriod: 300000, // 5 minut
  halfOpenMaxCalls: 3
});

export default FakturoidCircuitBreaker; 