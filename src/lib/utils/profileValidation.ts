export interface ProfileValidationResult {
  isComplete: boolean;
  missingFields: string[];
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

  // Check allergies description if allergies is true
  if (profile.allergies === true) {
    if (!profile.allergies_description || profile.allergies_description.trim() === '') {
      missingFields.push('Popis alergií');
    }
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