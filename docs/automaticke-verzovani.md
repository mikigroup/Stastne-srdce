# Automatické verzování a deploy

Tento dokument popisuje nastavení automatického verzování a deploy pro projekt Malý Leo.

## Komponenty řešení

### 1. GitHub Actions Workflow
- **Soubor**: `.github/workflows/release.yml`
- **Funkce**: Automatické zvýšení verze při push do main větve
- **Proces**:
  1. Zvýší verzi v `package.json` pomocí `npm-bump`
  2. Přidá GitHub hash k verzi (např. `1.1.1-a1b2c3d`)
  3. Aktualizuje verzi v patičce (`Footer.svelte`)
  4. Spustí deploy na Vercel

### 2. Development Workflow
- **Soubor**: `.github/workflows/dev-deploy.yml`
- **Funkce**: Deploy bez zvýšení verze pro development větve
- **Proces**:
  1. Nastaví dev verzi s hash (např. `1.1.0-dev-a1b2c3d`)
  2. Aktualizuje patičku
  3. Spustí deploy na Vercel

### 3. Manuální Release Workflow
- **Soubor**: `.github/workflows/manual-release.yml`
- **Funkce**: Manuální spuštění release s výběrem typu verze
- **Přístup**: GitHub Actions → Manual Release → Run workflow

### 4. Konfigurace prostředí
- **SvelteKit**: Nastaveno pro načítání `PUBLIC_` proměnných
- **Build script**: Automaticky nastavuje `PUBLIC_VERSION` z `package.json`
- **Footer**: Dynamicky zobrazuje aktuální verzi

## Nastavení GitHub Secrets

V GitHub repozitáři nastavte následující secrets:

### Povinné secrets:
- `VERCEL_TOKEN` - Token z Vercel Dashboard

### Povinné variables:
- `VERCEL_PROJECT_ID` - ID projektu z Vercel (najdete v nastavení projektu)

### Automatické:
- `GITHUB_TOKEN` - Poskytuje GitHub automaticky

## Jak to funguje

### Produkční workflow (main větev):
1. **Push do main větve** → Spustí se automatické zvýšení verze
2. **Zvýšení verze** → Automaticky se zvýší patch verze (např. 1.1.0 → 1.1.1)
3. **Přidání hashe** → Verze se zobrazí jako "core1.1.1-a1b2c3d"
4. **Deploy** → Automaticky se spustí deploy na Vercel

### Development workflow (develop/dev větev):
1. **Push do develop větve** → Spustí se development deploy
2. **Dev verze** → Verze se zobrazí jako "core1.1.0-dev-a1b2c3d"
3. **Deploy** → Deploy na Vercel bez zvýšení verze

### Lokální vývoj:
- **npm run dev** → Zobrazí "core1.1.0-local"
- **npm run build** → Zobrazí "core1.1.0"
- **npm run build:dev** → Zobrazí "core1.1.0-dev"

## Výhody tohoto řešení

- ✅ **Kompletní automatizace** - verzování → aktualizace UI → deploy v jednom workflow
- ✅ **Žádné lokální hooky** - vše běží na GitHubu, neovlivňuje vývojáře
- ✅ **Soulad s Vercel** - deploy se trigguje automaticky po commitu nové verze
- ✅ **Bezpečnost** - verze se propaguje jako build-time proměnná
- ✅ **Jednoduchost** - minimum závislostí

## Troubleshooting

### Workflow se nespustí
- Zkontrolujte, že pushujete do `main` větve
- Ověřte, že máte nastavené všechny required secrets

### Verze se nezobrazuje
- Zkontrolujte, že `PUBLIC_VERSION` je nastaveno v build procesu
- Ověřte, že Footer komponenta používá `{version}` proměnnou

### Deploy se nespustí
- Zkontrolujte `VERCEL_TOKEN` secret a `VERCEL_PROJECT_ID` variable
- Ověřte, že máte správná oprávnění v Vercel projektu 