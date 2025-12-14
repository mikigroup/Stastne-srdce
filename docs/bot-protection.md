# Ochrana proti bot registracím

## Přehled

Tento dokument popisuje implementované ochranné mechanismy proti bot registracím v aplikaci.

## Implementované ochrany

### 1. reCAPTCHA v3

**Lokace:**
- `src/lib/utils/recaptcha.ts` - Utility funkce pro validaci
- `src/routes/auth/signup/+page.server.ts` - Customer signup
- `src/routes/admin/signup/+page.server.ts` - Admin signup
- `src/routes/+layout.svelte` - Globální načtení skriptu

**Jak to funguje:**
- Invisible reCAPTCHA v3 běží na pozadí
- Při odeslání formuláře se vygeneruje token
- Server ověří token u Google API
- Minimální skóre: 0.5 (konfigurovatelné)
- Akce: `signup` (customer) / `admin_signup` (admin)

**Konfigurace:**
- `PUBLIC_RECAPTCHA_SITE_KEY` - Veřejný klíč (frontend)
- `PRIVATE_RECAPTCHA_SECRET_KEY` - Soukromý klíč (backend)

### 2. Detekce náhodných řetězců

**Lokace:** `src/lib/utils/botDetection.ts`

**Detekované vzorce:**
- Příliš mnoho velkých písmen (>60% v dlouhých textech)
- Absence mezer v dlouhých textech (>15 znaků)
- Vysoký poměr unikátních znaků (>80%)
- Absence nebo velmi málo samohlásek (<15%)
- Příliš mnoho číslic v textových polích
- Střídání velkých/malých písmen bez logiky (>70% změn)
- Všechny znaky stejné

**Příklady detekovaných bot dat:**
```
first_name: "urDKKUnMQxQZKOwpeKQHr" ❌
last_name: "BfUUOKkcyRUjvjrhngGOFLgJ" ❌
street: "rehBhSdxWRrOIlMVsmO" ❌
city: "xBLyoToQhTPRZmUwxsqUE" ❌
```

### 3. Validace českých formátů

**Lokace:** `src/lib/utils/botDetection.ts`

**Validované formáty:**
- **PSČ:** 5 číslic nebo formát `123 45`
- **Telefon:** `+420XXXXXXXXX`, `00420XXXXXXXXX`, nebo 9 číslic
- **IČO:** 8 číslic
- **DIČ:** `CZ` + 8-10 číslic

**Příklady neplatných bot dat:**
```
zip_code: "iDkqbkMRHkFSNlLeQsKCMK" ❌ (očekáváno: 5 číslic)
telephone: "2837471872" ⚠️ (10 číslic, ale bez formátu)
ico: "HKiEIJVxvvyZxICnjgs" ❌ (očekáváno: 8 číslic)
dic: "WohzbGUOHJhUALjd" ❌ (očekáváno: CZ + 8-10 číslic)
```

### 4. Detekce dočasných emailů

**Lokace:** `src/lib/utils/botDetection.ts`

**Blokované domény:**
- 10minutemail.com, guerrillamail.com, mailinator.com
- temp-mail.org, tempmail.com, trashmail.com
- yopmail.com, throwaway.email, getnada.com
- A dalších 30+ známých dočasných emailových služeb

**Kde se kontroluje:**
- `src/routes/auth/signup/+page.server.ts` - Při registraci
- `src/routes/auth/signup/complete/+page.server.ts` - Při dokončení profilu

### 5. Komplexní bot detection

**Lokace:** `src/lib/utils/botDetection.ts` - funkce `detectBotRegistration()`

**Kontroluje:**
- Všechna textová pole na náhodné řetězce
- Formáty PSČ, telefonu, IČO, DIČ
- Podobnost polí (stejná délka, všechny náhodné)
- Kombinace více podezřelých vzorců

**Výstup:**
- `isBot: boolean` - Je to bot?
- `confidence: number` - Jistota (0-1)
- `reasons: string[]` - Důvody detekce

**Threshold:** 50% confidence = bot

**Kde se používá:**
- `src/routes/auth/signup/complete/+page.server.ts` - Před uložením profilu

### 6. Zachování emailu v profilech

**Lokace:** `src/routes/auth/signup/complete/+page.server.ts`

**Problém:**
- Boti měli `email: null` v tabulce `profiles`
- `upsert` přepisoval celý záznam

**Řešení:**
- Kontrola existence profilu
- Pokud existuje → `UPDATE` (zachová email)
- Pokud neexistuje → `INSERT` (vytvoří nový)
- Email se aktualizuje jen pokud není v existujícím profilu

## Analýza bot dat

### Typické vzorce bot registrací:

1. **Náhodné řetězce:**
   - Mix velkých a malých písmen
   - Délka 15-25 znaků
   - Žádné mezery
   - Žádné české znaky (á, é, í, ó, ú, ů, ý, č, ď, ě, ň, ř, š, ť, ž)

2. **Neplatné formáty:**
   - PSČ není 5 číslic
   - Telefon není ve formátu +420 nebo 9 číslic
   - IČO není 8 číslic
   - DIČ není CZ + 8-10 číslic

3. **Chybějící email:**
   - `email: null` v tabulce `profiles`
   - Email existuje v `auth.users`, ale ne v `profiles`

4. **Všechna pole podobně dlouhá:**
   - Nízká variance v délkách polí
   - Všechna pole jsou náhodné řetězce

## Logování

Všechny detekce botů se logují do konzole s prefixy:
- `⚠️ [CUSTOMER SIGNUP]` - Customer signup
- `⚠️ [ADMIN SIGNUP]` - Admin signup
- `⚠️ [SIGNUP COMPLETE]` - Dokončení profilu

**Příklad logu:**
```
⚠️ [SIGNUP COMPLETE] Bot detection triggered: {
  userId: "...",
  email: "...",
  confidence: 0.85,
  reasons: [
    "Jméno vypadá jako náhodný řetězec",
    "PSČ není ve správném formátu",
    "Telefonní číslo není ve správném formátu"
  ]
}
```

## Konfigurace

### Environment proměnné

```env
# reCAPTCHA
PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
PRIVATE_RECAPTCHA_SECRET_KEY=your_secret_key
```

### Threshold hodnoty

V `src/lib/utils/botDetection.ts`:
- Bot detection threshold: `0.5` (50%)
- reCAPTCHA score threshold: `0.5` (v `recaptcha.ts`)

## Testování

### Testování bot detection

```typescript
import { detectBotRegistration } from "$lib/utils/botDetection";

const result = detectBotRegistration({
  first_name: "urDKKUnMQxQZKOwpeKQHr",
  last_name: "BfUUOKkcyRUjvjrhngGOFLgJ",
  street: "rehBhSdxWRrOIlMVsmO",
  city: "xBLyoToQhTPRZmUwxsqUE",
  zip_code: "iDkqbkMRHkFSNlLeQsKCMK",
  telephone: "2837471872"
});

console.log(result);
// {
//   isBot: true,
//   confidence: 0.85,
//   reasons: [...]
// }
```

### Testování validace formátů

```typescript
import { 
  isValidCzechPostalCode,
  isValidCzechPhone,
  isValidCzechICO,
  isValidCzechDIC
} from "$lib/utils/botDetection";

isValidCzechPostalCode("12345"); // true
isValidCzechPostalCode("123 45"); // true
isValidCzechPostalCode("iDkqbkMRHkFSNlLeQsKCMK"); // false

isValidCzechPhone("+420123456789"); // true
isValidCzechPhone("123456789"); // true
isValidCzechPhone("2837471872"); // false (10 číslic)

isValidCzechICO("12345678"); // true
isValidCzechICO("HKiEIJVxvvyZxICnjgs"); // false

isValidCzechDIC("CZ12345678"); // true
isValidCzechDIC("WohzbGUOHJhUALjd"); // false
```

## Budoucí vylepšení

- [ ] Rate limiting per IP
- [ ] Rate limiting per email
- [ ] Honeypot fields
- [ ] Detekce podezřelých vzorců v telefonu (opakující se číslice)
- [ ] Machine learning model pro detekci botů
- [ ] Blacklist IP adres
- [ ] Whitelist známých emailových domén

## Reference

- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Bot Detection Best Practices](https://owasp.org/www-community/attacks/Brute_force_attack)

