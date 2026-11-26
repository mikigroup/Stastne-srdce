export interface ProfileValidationResult {
  isComplete: boolean;
  missingFields: string[];
}

export type DeliveryFields = {
  delivery_first_name: string | null;
  delivery_last_name: string | null;
  delivery_telephone: string | null;
  delivery_street: string | null;
  delivery_street_number: string | null;
  delivery_city: string | null;
  delivery_zip_code: string | null;
};

/** Vrátí dodací údaje jen když je sekce otevřená. Sbalená sekce uloženou adresu nemění. */
export function deliveryFieldsFromForm(
  separate: boolean,
  read: (name: keyof DeliveryFields) => string | null | undefined
): DeliveryFields | null {
  if (!separate) return null;
  const text = (name: keyof DeliveryFields) => {
    const trimmed = read(name)?.trim() ?? "";
    return trimmed || null;
  };
  return {
    delivery_first_name: text("delivery_first_name"),
    delivery_last_name: text("delivery_last_name"),
    delivery_telephone: text("delivery_telephone"),
    delivery_street: text("delivery_street"),
    delivery_street_number: text("delivery_street_number"),
    delivery_city: text("delivery_city"),
    delivery_zip_code: text("delivery_zip_code")
  };
}

export function validateProfileForInvoicing(profile: {
  first_name?: string | null;
  last_name?: string | null;
  street?: string | null;
  street_number?: string | null;
  city?: string | null;
  zip_code?: string | null;
  email?: string | null;
  company?: string | null;
  ico?: string | null;
  dic?: string | null;
  telephone?: string | null;
  allergies?: boolean | null;
  allergies_description?: string | null;
  delivery_method?: string | null;
  payment_method?: string | null;
  delivery_street?: string | null;
  delivery_street_number?: string | null;
  delivery_city?: string | null;
  delivery_zip_code?: string | null;
}): ProfileValidationResult {
  const missingFields: string[] = [];
  
  // Required fields for all customers (based on signup/complete requirements)
  const requiredFields = [
    { field: profile.first_name, name: 'Jméno' },
    { field: profile.last_name, name: 'Příjmení' },
    { field: profile.street, name: 'Ulice' },
    { field: profile.street_number, name: 'Číslo popisné' },
    { field: profile.city, name: 'Město' },
    { field: profile.zip_code, name: 'PSČ' },
    { field: profile.email, name: 'Email' },
    { field: profile.telephone, name: 'Telefon' },
    { field: profile.delivery_method, name: 'Způsob dodání' },
    { field: profile.payment_method, name: 'Způsob platby' }
  ];

  // Check required fields
  requiredFields.forEach(({ field, name }) => {
    if (!field || field.trim() === '') {
      missingFields.push(name);
    }
  });

  // NOVÉ: Alergie jsou nyní povinné pole
  // Musí být explicitně vybrána hodnota (true nebo false)
  if (profile.allergies === null || profile.allergies === undefined) {
    missingFields.push('Alergie (musí být vybrána odpověď ano/ne)');
  }

  // Pokud má alergie, musí být vyplněn popis
  if (profile.allergies === true) {
    if (!profile.allergies_description || profile.allergies_description.trim() === '') {
      missingFields.push('Popis alergií');
    }
  }

  const deliveryParts = [
    { field: profile.delivery_street, name: 'Dodací ulice' },
    { field: profile.delivery_street_number, name: 'Dodací číslo popisné' },
    { field: profile.delivery_city, name: 'Dodací město' },
    { field: profile.delivery_zip_code, name: 'Dodací PSČ' }
  ];
  const hasDeliveryAddress = deliveryParts.some(({ field }) => field && field.trim() !== '');
  if (hasDeliveryAddress) {
    deliveryParts.forEach(({ field, name }) => {
      if (!field || field.trim() === '') {
        missingFields.push(name);
      }
    });
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}

export function getProfileValidationMessage(validationResult: ProfileValidationResult): string {
  if (validationResult.isComplete) {
    return '';
  }

  return `${validationResult.missingFields.join(', ')}.`;
} 