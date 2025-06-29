import { json } from '@sveltejs/kit';
import { fakturoidCircuitBreaker } from '$lib/fakturoidCircuitBreaker';
import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const detailed = url.searchParams.get('detailed') === 'true';
		
		// Základní health check data
		const circuitMetrics = fakturoidCircuitBreaker.getMetrics();
		
		const healthStatus = {
			timestamp: new Date().toISOString(),
			status: circuitMetrics.state === 'closed' ? 'healthy' : 
			        circuitMetrics.state === 'half_open' ? 'degraded' : 'unhealthy',
			circuit_breaker: {
				state: circuitMetrics.state,
				failures: circuitMetrics.failures,
				successes: circuitMetrics.successes,
				total_calls: circuitMetrics.totalCalls,
				rejected_calls: circuitMetrics.rejectedCalls,
				last_failure: circuitMetrics.lastFailureTime ? 
					new Date(circuitMetrics.lastFailureTime).toISOString() : null,
				last_success: circuitMetrics.lastSuccessTime ? 
					new Date(circuitMetrics.lastSuccessTime).toISOString() : null
			}
		};

		// Detailed informace (pokud je požadováno)
		if (detailed) {
			try {
				// Statistiky z databáze
				const { data: tokenStats } = await supabase
					.from('fakturoid_tokens')
					.select('status, expires_at, refresh_attempts, last_used_at')
					.order('updated_at', { ascending: false });

				const now = new Date();
				const stats = {
					total_tokens: tokenStats?.length || 0,
					active_tokens: tokenStats?.filter(t => t.status === 'active').length || 0,
					expired_tokens: tokenStats?.filter(t => t.status === 'expired').length || 0,
					refreshing_tokens: tokenStats?.filter(t => t.status === 'refreshing').length || 0,
					tokens_expiring_soon: tokenStats?.filter(t => {
						if (!t.expires_at) return false;
						const expiresAt = new Date(t.expires_at);
						const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
						return expiresAt <= oneHourFromNow && t.status === 'active';
					}).length || 0,
					high_refresh_attempts: tokenStats?.filter(t => 
						(t.refresh_attempts || 0) > 3
					).length || 0
				};

				// Testovací ping na Fakturoid API (jen základní endpoint)
				let fakturoid_api_status = 'unknown';
				let fakturoid_api_response_time = null;
				
				try {
					const startTime = Date.now();
					const testResponse = await fetch('https://app.fakturoid.cz/api/v3/accounts', {
						method: 'GET',
						headers: {
							'User-Agent': 'StastneSrdce-HealthCheck (support@stastne-srdce.cz)',
							'Accept': 'application/json'
						},
						signal: AbortSignal.timeout(5000) // 5 sekund timeout
					});
					
					fakturoid_api_response_time = Date.now() - startTime;
					fakturoid_api_status = testResponse.status === 401 ? 'reachable' : 'unknown';
					
					// 401 je očekávaný status pro neautorizovaný request
					// 200-299 by také znamenalo, že API je dostupné
					if (testResponse.status >= 200 && testResponse.status < 300) {
						fakturoid_api_status = 'reachable';
					}
				} catch (error: any) {
					fakturoid_api_status = 'unreachable';
					console.error('Fakturoid API health check failed:', error?.message);
				}

				(healthStatus as any).detailed = {
					database_stats: stats,
					fakturoid_api: {
						status: fakturoid_api_status,
						response_time_ms: fakturoid_api_response_time
					},
					recommendations: generateHealthRecommendations(circuitMetrics, stats)
				};
				
			} catch (dbError) {
				console.error('Failed to get detailed health info:', dbError);
				(healthStatus as any).detailed = {
					error: 'Failed to retrieve detailed health information'
				};
			}
		}

		// HTTP status code na základě zdraví
		const httpStatus = healthStatus.status === 'healthy' ? 200 :
		                  healthStatus.status === 'degraded' ? 200 : 503;

		return json(healthStatus, { status: httpStatus });
		
	} catch (error) {
		console.error('Health check endpoint error:', error);
		return json({
			timestamp: new Date().toISOString(),
			status: 'error',
			error: 'Health check failed'
		}, { status: 500 });
	}
};

/**
 * Generuje doporučení na základě health metrik
 */
function generateHealthRecommendations(circuitMetrics: any, stats: any): string[] {
	const recommendations: string[] = [];

	// Circuit breaker doporučení
	if (circuitMetrics.state === 'open') {
		recommendations.push('Circuit breaker is open - Fakturoid API is experiencing issues. Wait for automatic recovery.');
	}
	
	if (circuitMetrics.failures > 3) {
		recommendations.push(`High failure rate detected (${circuitMetrics.failures} failures). Monitor Fakturoid API status.`);
	}
	
	if (circuitMetrics.rejectedCalls > 10) {
		recommendations.push(`Many calls rejected by circuit breaker (${circuitMetrics.rejectedCalls}). Consider scaling down requests.`);
	}

	// Database/token doporučení
	if (stats.expired_tokens > stats.active_tokens) {
		recommendations.push('More expired tokens than active ones. Consider running token maintenance.');
	}
	
	if (stats.tokens_expiring_soon > 5) {
		recommendations.push(`${stats.tokens_expiring_soon} tokens expiring soon. Proactive refresh recommended.`);
	}
	
	if (stats.high_refresh_attempts > 0) {
		recommendations.push(`${stats.high_refresh_attempts} tokens with high refresh attempts. Check for refresh issues.`);
	}
	
	if (stats.refreshing_tokens > 3) {
		recommendations.push(`${stats.refreshing_tokens} tokens stuck in refreshing state. May need manual intervention.`);
	}

	if (recommendations.length === 0) {
		recommendations.push('System is healthy. No immediate actions required.');
	}

	return recommendations;
} 