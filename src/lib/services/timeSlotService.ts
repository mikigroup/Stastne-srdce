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
 * Formátuje časový slot pro zobrazení
 */
export function formatTimeSlot(slot: TimeSlot): string {
	return `${slot.startTime} - ${slot.endTime}`;
} 