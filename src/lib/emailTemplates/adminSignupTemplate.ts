export function createAdminSignupEmailTemplate(confirmationLink: string, email: string): string {
    return `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Potvrďte svou registraci - Šťastné srdce</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4A5568 0%, #2D3748 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
        }
        .welcome-text {
            font-size: 16px;
            margin-bottom: 20px;
            color: #4A5568;
        }
        .confirmation-button {
            display: inline-block;
            background: linear-gradient(135deg, #38A169 0%, #2F855A 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .confirmation-button:hover {
            background: linear-gradient(135deg, #2F855A 0%, #276749 100%);
        }
        .info-box {
            background-color: #EBF8FF;
            border: 1px solid #BEE3F8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box h3 {
            margin: 0 0 10px 0;
            color: #2B6CB0;
            font-size: 16px;
        }
        .info-box p {
            margin: 5px 0;
            color: #9F9F9F;
        }
        .footer {
            background-color: #F7FAFC;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #E2E8F0;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #E2E8F0;
        }
        .contact-info p {
            margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header {
                padding: 20px 15px;
            }
            .content {
                padding: 20px 15px;
            }
            .confirmation-button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💚 Šťastné srdce</div>
            <h1>Potvrďte svou registraci</h1>
        </div>
        
        <div class="content">
            <p class="welcome-text">
                Dobrý den,<br><br>
                děkujeme za Váš zájem stát se naším stravníkem. Pro dokončení registrace prosím klikněte na tlačítko níže:
            </p>
            
            <div style="text-align: center;">
                <a href="${confirmationLink}" class="confirmation-button">
                    ✅ Potvrdit registraci
                </a>
            </div>
            
            <div class="info-box">
                <h3>📧 Registrační údaje</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Typ účtu:</strong> Administrátor</p>
                <p><strong>Platnost odkazu:</strong> 24 hodin</p>
            </div>
            
            <p style="color: #718096; font-size: 14px;">
                Pokud jste nepožádali o registraci, můžete tento email ignorovat. 
                Odkaz je platný pouze 24 hodin od odeslání.
            </p>
            
            <p style="color: #718096; font-size: 14px;">
                Pokud tlačítko nefunguje, zkopírujte tento odkaz do prohlížeče:<br>
                <a href="${confirmationLink}" style="color: #3182CE; word-break: break-all;">${confirmationLink}</a>
            </p>
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <p><strong>Šťastné srdce</strong></p>
                <p>info@stastnesrdce.cz</p>
                <p>www.stastnesrdce.cz</p>
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #A0AEC0;">
                Tento email byl odeslán automaticky. Prosím neodpovídejte na něj.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}
