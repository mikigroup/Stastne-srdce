import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";

// Reuse the same transporter configuration as in kosik
const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: PRIVATE_seznam_key
	}
});

interface DataDeletionEmailParams {
	email: string;
	firstName: string;
	lastName: string;
	deletionDate: string;
	scheduledDate: string;
	reactivationToken: string;
	baseUrl: string;
}

/**
 * Send data deletion request confirmation email with reactivation link
 */
export async function sendDataDeletionRequestEmail(params: DataDeletionEmailParams) {
	const { email, firstName, lastName, deletionDate, scheduledDate, reactivationToken, baseUrl } = params;
	
	const reactivationUrl = `${baseUrl}/auth/reactivate?token=${reactivationToken}`;
	console.log('📧 Generated reactivation URL:', reactivationUrl);
	const deletionDateFormatted = new Date(deletionDate).toLocaleDateString('cs-CZ', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	const scheduledDateFormatted = new Date(scheduledDate).toLocaleDateString('cs-CZ', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const mailOptions = {
		from: '"Šťastné srdce" <info@stastnesrdce.cz>',
		to: email,
		subject: 'Žádost o smazání osobních dat - máte 30 dní na rozmyšlenou',
		html: `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #374151;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
        }
        .alert-box {
            background-color: #FEF3C7;
            border: 1px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box {
            background-color: #DBEAFE;
            border: 1px solid #3B82F6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .reactivation-button {
            display: inline-block;
            background-color: #10B981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 0.9em;
        }
        .legal-text {
            font-size: 0.8em;
            color: #666666;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Žádost o smazání osobních dat</h1>
    </div>
    
    <div class="content">
        <p>Dobrý den ${firstName} ${lastName},</p>
        
        <p>obdrželi jsme Vaši žádost o <strong>smazání osobních údajů</strong> v souladu s GDPR (EU 2016/679).</p>

        <div class="alert-box">
            <h3>⏰ Důležité informace:</h3>
            <ul>
                <li><strong>Žádost podána:</strong> ${deletionDateFormatted}</li>
                <li><strong>Plánované smazání:</strong> ${scheduledDateFormatted}</li>
                <li><strong>Doba na rozmyšlenou:</strong> 30 dní</li>
            </ul>
        </div>

        <div class="info-box">
            <h3>💡 Možnost zrušení žádosti</h3>
            <p>Pokud si to rozmyslíte, můžete žádost o smazání <strong>zrušit kdykoliv do ${scheduledDateFormatted}</strong>:</p>
            
            <h4>🔗 Možnost 1: Reaktivační odkaz (doporučeno)</h4>
            <p style="text-align: center;">
                <a href="${reactivationUrl}" class="reactivation-button">
                    🔓 Zrušit žádost a obnovit účet
                </a>
            </p>
            
            <h4>🔑 Možnost 2: Běžné přihlášení</h4>
            <p>Můžete se také jednoduše <strong>přihlásit na váš účet</strong> na:</p>
            <p style="text-align: center;">
                <a href="${baseUrl}/login" style="color: #3B82F6; text-decoration: underline;">
                    ${baseUrl}/login
                </a>
            </p>
            <p style="font-size: 0.9em; color: #666;">
                ⚠️ <strong>Pozor:</strong> Pokud máte problém s přihlášením kvůli pozastavení účtu, použijte reaktivační odkaz výše.
            </p>
            
            <p><strong>Upozornění:</strong> Tento odkaz je platný pouze do ${scheduledDateFormatted}.</p>
        </div>

        <h3>Co se stane s Vašimi daty:</h3>
        <ul>
            <li>✅ <strong>Osobní údaje</strong> budou po 30 dnech úplně smazány</li>
            <li>✅ <strong>Faktury a účetní doklady</strong> zůstanou uloženy 10 let (zákonná povinnost)</li>
            <li>✅ <strong>Anonymizované statistiky</strong> mohou zůstat zachovány (bez osobních údajů)</li>
        </ul>

        <h3>Co se stane s Vaším účtem:</h3>
        <ul>
            <li>🚫 Účet je během 30 dní <strong>pozastaven</strong> - nelze se přihlásit</li>
            <li>🚫 Nemůžete vytvářet nové objednávky</li>
            <li>✅ Máte možnost účet kdykoliv obnovit (pomocí odkazu výše)</li>
        </ul>

        <div class="legal-text">
            <p><strong>Právní základ:</strong></p>
            <p>Zpracování probíhá v souladu s:</p>
            <ul>
                <li>GDPR (EU 2016/679) - Článek 17 "Právo na výmaz"</li>
                <li>Zákon č. 110/2019 Sb., o zpracování osobních údajů</li>
                <li>Zákon č. 563/1991 Sb., o účetnictví (uchovávání faktur)</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>Šťastné srdce<br>
        info@stastnesrdce.cz<br>
        www.stastnesrdce.cz</p>
        
        <p>V případě dotazů nás neváhejte kontaktovat.</p>
    </div>
</body>
</html>
        `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`GDPR deletion request email sent to: ${email}`);
		return { success: true };
	} catch (error) {
		console.error("Error sending GDPR deletion email:", error);
		return { success: false, error };
	}
}

/**
 * Send account reactivation confirmation email
 */
export async function sendAccountReactivationEmail(params: { 
	email: string; 
	firstName: string; 
	lastName: string; 
}) {
	const { email, firstName, lastName } = params;

	const mailOptions = {
		from: '"Šťastné srdce" <info@stastnesrdce.cz>',
		to: email,
		subject: 'Váš účet byl úspěšně obnoven',
		html: `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #10B981;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
        }
        .success-box {
            background-color: #D1FAE5;
            border: 1px solid #10B981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Účet byl obnoven</h1>
    </div>
    
    <div class="content">
        <p>Dobrý den ${firstName} ${lastName},</p>
        
        <div class="success-box">
            <h3>🎉 Váš účet byl úspěšně obnoven!</h3>
            <p>Žádost o smazání osobních dat byla <strong>zrušena</strong>. Můžete se opět přihlásit a používat náš systém jako obvykle.</p>
        </div>

        <p>Co se obnovilo:</p>
        <ul>
            <li>✅ Přístup k vašemu účtu</li>
            <li>✅ Možnost vytvářet objednávky</li>
            <li>✅ Historie objednávek</li>
            <li>✅ Všechny vaše osobní údaje</li>
        </ul>

        <p>Děkujeme, že jste se rozhodli zůstat s námi!</p>
    </div>

    <div class="footer">
        <p>Šťastné srdce<br>
        info@stastnesrdce.cz<br>
        www.stastnesrdce.cz</p>
    </div>
</body>
</html>
        `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Account reactivation email sent to: ${email}`);
		return { success: true };
	} catch (error) {
		console.error("Error sending reactivation email:", error);
		return { success: false, error };
	}
} 