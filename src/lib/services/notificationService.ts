import { sendEmail } from '$lib/email';
import type { TypedSupabaseClient } from '$lib/supabase';
import { getSetting } from './siteSettingsService';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
  enabled: boolean;
}

export interface NotificationTrigger {
  id: string;
  name: string;
  type: 'order_created' | 'order_reminder' | 'birthday' | 'loyalty_upgrade' | 'menu_update' | 'payment_reminder';
  conditions: Record<string, any>;
  templateId: string;
  enabled: boolean;
}

export interface NotificationLog {
  id: string;
  customerId: string;
  triggerId: string;
  templateId: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

/**
 * Načte emailové šablony z nastavení
 */
export async function getEmailTemplates(supabase: TypedSupabaseClient): Promise<Record<string, string>> {
  try {
    const settings = await getSetting(supabase, 'email');
    return settings || {};
  } catch (error) {
    console.error('Error loading email templates:', error);
    return {};
  }
}

/**
 * Nahradí proměnné v šabloně skutečnými hodnotami
 */
export function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return result;
}

/**
 * Odešle uvítací email novému zákazníkovi
 */
export async function sendWelcomeEmail(
  supabase: TypedSupabaseClient,
  customerEmail: string,
  customerName: string
): Promise<boolean> {
  try {
    const templates = await getEmailTemplates(supabase);
    const template = templates.welcomeEmailTemplate || 'Vítejte v Šťastném srdci! Děkujeme za registraci.';
    
    const subject = 'Vítejte v Šťastném srdci!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3CB371;">Vítejte v Šťastném srdci!</h2>
        <p>Dobrý den ${customerName},</p>
        <p>${template}</p>
        <p>Můžete si objednat zdravé obědy na našich stránkách.</p>
        <p>S pozdravem,<br>Tým Šťastné srdce</p>
      </div>
    `;
    
    await sendEmail({ to: customerEmail, subject, html });
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Odešle narozeninový email se slevou
 */
export async function sendBirthdayEmail(
  supabase: TypedSupabaseClient,
  customerEmail: string,
  customerName: string,
  discount: number
): Promise<boolean> {
  try {
    const templates = await getEmailTemplates(supabase);
    const template = templates.birthdayEmailTemplate || 'Všechno nejlepší k narozeninám! Máte slevu {{discount}}%.';
    
    const subject = 'Všechno nejlepší k narozeninám! 🎂';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EAB308;">🎂 Všechno nejlepší k narozeninám!</h2>
        <p>Dobrý den ${customerName},</p>
        <p>${replaceTemplateVariables(template, { discount })}</p>
        <p>Přijďte si pochutnat na našich zdravých obědech!</p>
        <p>S pozdravem,<br>Tým Šťastné srdce</p>
      </div>
    `;
    
    await sendEmail({ to: customerEmail, subject, html });
    return true;
  } catch (error) {
    console.error('Error sending birthday email:', error);
    return false;
  }
}

/**
 * Odešle notifikaci o povýšení ve věrnostním systému
 */
export async function sendLoyaltyUpgradeEmail(
  supabase: TypedSupabaseClient,
  customerEmail: string,
  customerName: string,
  tierName: string,
  tierLabel: string
): Promise<boolean> {
  try {
    const templates = await getEmailTemplates(supabase);
    const template = templates.loyaltyUpgradeTemplate || 'Gratulujeme! Byli jste povýšeni na {{tierName}}.';
    
    const subject = 'Gratulujeme k povýšení! ⭐';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">⭐ Gratulujeme k povýšení!</h2>
        <p>Dobrý den ${customerName},</p>
        <p>${replaceTemplateVariables(template, { tierName: tierLabel })}</p>
        <p>Vaše věrnost byla oceněna. Užijte si výhody nové úrovně!</p>
        <p>S pozdravem,<br>Tým Šťastné srdce</p>
      </div>
    `;
    
    await sendEmail({ to: customerEmail, subject, html });
    return true;
  } catch (error) {
    console.error('Error sending loyalty upgrade email:', error);
    return false;
  }
}

/**
 * Odešle připomínku objednávky
 */
export async function sendOrderReminderEmail(
  supabase: TypedSupabaseClient,
  customerEmail: string,
  customerName: string
): Promise<boolean> {
  try {
    const templates = await getEmailTemplates(supabase);
    const template = templates.orderReminderTemplate || 'Nezapomeňte si objednat oběd na zítra!';
    
    const subject = 'Připomínka objednávky 🍽️';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3CB371;">🍽️ Připomínka objednávky</h2>
        <p>Dobrý den ${customerName},</p>
        <p>${template}</p>
        <p>Podívejte se na naše dnešní menu a objednejte si zdravý oběd!</p>
        <p>S pozdravem,<br>Tým Šťastné srdce</p>
      </div>
    `;
    
    await sendEmail({ to: customerEmail, subject, html });
    return true;
  } catch (error) {
    console.error('Error sending order reminder email:', error);
    return false;
  }
}

/**
 * Zaloguje odeslání notifikace (prozatím jen do konzole)
 */
export async function logNotification(
  supabase: TypedSupabaseClient,
  customerId: string,
  triggerId: string,
  templateId: string,
  status: 'sent' | 'failed' | 'pending',
  error?: string
): Promise<void> {
  console.log(`Notification logged: ${triggerId} -> ${customerId} (${status})`);
  if (error) {
    console.error('Notification error:', error);
  }
} 