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
}): ProfileValidationResult {
  const missingFields: string[] = [];
  
  // Required fields for all customers
  const requiredFields = [
    { field: profile.first_name, name: 'Jméno' },
    { field: profile.last_name, name: 'Příjmení' },
    { field: profile.street, name: 'Ulice' },
    { field: profile.street_number, name: 'Číslo popisné' },
    { field: profile.city, name: 'Město' },
    { field: profile.zip_code, name: 'PSČ' },
    { field: profile.email, name: 'Email' }
  ];

  // Check required fields
  requiredFields.forEach(({ field, name }) => {
    if (!field || field.trim() === '') {
      missingFields.push(name);
    }
  });

  // If company is provided, check company-specific fields
  if (profile.company && profile.company.trim() !== '') {
    if (!profile.ico || profile.ico.trim() === '') {
      missingFields.push('IČO');
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

  return `Pro vytvoření faktury je nutné doplnit následující údaje: ${validationResult.missingFields.join(', ')}`;
} 