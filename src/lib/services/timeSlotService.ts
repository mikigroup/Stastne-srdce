import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export interface TimeSlot {
	startTime: string;
	endTime: string;
	maxOrders?: number; // Pro kompatibilitu se starými daty
}

export interface TimeSlotAvailability {
	slot: TimeSlot;
	isAvailable: boolean;
}

export interface TimeSlotSettings {
	timeSlotsEnabled: boolean;
	timeSlots: TimeSlot[];
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

	// Vrátí všechny definované sloty jako dostupné
	return settings.timeSlots.map(slot => ({
		slot: {
			startTime: slot.startTime,
			endTime: slot.endTime
			// Ignorujeme maxOrders
		},
		isAvailable: true
	}));
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

	return { valid: true };
} 