import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export interface TimeSlot {
	startTime: string;
	endTime: string;
	maxOrders: number;
}

export interface TimeSlotAvailability {
	slot: TimeSlot;
	availableOrders: number;
	totalOrders: number;
	isAvailable: boolean;
}

export interface TimeSlotSettings {
	timeSlotsEnabled: boolean;
	advanceOrderDays: number;
	orderDeadlineTime: string;
	timeSlots: TimeSlot[];
	showTimeSlotAvailability: boolean;
}

/**
 * Získá dostupné časové sloty pro daný den
 */
export async function getAvailableTimeSlots(
	supabase: SupabaseClient<Database>,
	date: string,
	settings: TimeSlotSettings
): Promise<TimeSlotAvailability[]> {
	if (!settings.timeSlotsEnabled || !settings.timeSlots) {
		return [];
	}

	const today = new Date();
	const targetDate = new Date(date);
	const daysDiff = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	// Kontrola, zda lze objednat na daný den
	if (daysDiff < 0 || daysDiff > settings.advanceOrderDays) {
		return [];
	}

	// Kontrola uzavíracího času pro dnešní den
	if (daysDiff === 0) {
		const now = new Date();
		const [deadlineHours, deadlineMinutes] = settings.orderDeadlineTime.split(':').map(Number);
		const deadline = new Date();
		deadline.setHours(deadlineHours, deadlineMinutes, 0, 0);

		if (now >= deadline) {
			return [];
		}
	}

	// Získání počtu objednávek pro každý slot
	const { data: orders, error } = await supabase
		.from('orders')
		.select('id, note, date')
		.eq('date', date);

	if (error) {
		console.error('Chyba při načítání objednávek:', error);
		return [];
	}

	// Počítání objednávek pro každý slot
	const slotCounts = new Map<string, number>();
	orders?.forEach(order => {
		if (order.note) {
			try {
				const noteData = JSON.parse(order.note);
				if (noteData.timeSlot) {
					const slotKey = noteData.timeSlot;
					const count = slotCounts.get(slotKey) || 0;
					slotCounts.set(slotKey, count + 1);
				}
			} catch (e) {
				// Pokud note není JSON, ignorujeme
			}
		}
	});

	// Vytvoření dostupnosti pro každý slot
	return settings.timeSlots.map(slot => {
		const slotKey = `${slot.startTime}-${slot.endTime}`;
		const totalOrders = slotCounts.get(slotKey) || 0;
		const availableOrders = Math.max(0, slot.maxOrders - totalOrders);
		const isAvailable = availableOrders > 0;

		return {
			slot,
			availableOrders,
			totalOrders,
			isAvailable
		};
	});
}

/**
 * Zkontroluje, zda je časový slot dostupný
 */
export function isTimeSlotAvailable(
	slot: TimeSlot,
	availableSlots: TimeSlotAvailability[]
): boolean {
	const availability = availableSlots.find(
		av => av.slot.startTime === slot.startTime && av.slot.endTime === slot.endTime
	);
	return availability?.isAvailable || false;
}

/**
 * Formátuje časový slot pro zobrazení
 */
export function formatTimeSlot(slot: TimeSlot): string {
	return `${slot.startTime} - ${slot.endTime}`;
}

/**
 * Získá nejbližší dostupný časový slot
 */
export function getNextAvailableSlot(availableSlots: TimeSlotAvailability[]): TimeSlotAvailability | null {
	const now = new Date();
	const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

	return availableSlots.find(slot => 
		slot.isAvailable && slot.slot.startTime > currentTime
	) || availableSlots.find(slot => slot.isAvailable) || null;
}

/**
 * Validuje časový slot
 */
export function validateTimeSlot(slot: TimeSlot): { valid: boolean; error?: string } {
	if (!slot.startTime || !slot.endTime) {
		return { valid: false, error: 'Čas začátku a konce je povinný' };
	}

	if (slot.startTime >= slot.endTime) {
		return { valid: false, error: 'Čas konce musí být po čase začátku' };
	}

	if (slot.maxOrders < 1) {
		return { valid: false, error: 'Maximální počet objednávek musí být alespoň 1' };
	}

	return { valid: true };
} 