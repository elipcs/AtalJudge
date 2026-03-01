/**
 * @module services/EmailService
 * @description Service for sending email notifications and communications.
 * 
 * Handles email templates and SMTP delivery.
 */

import { injectable } from 'tsyringe';
import * as nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils';

/**
 * Service for email notifications.
 * @class EmailService
 */
@injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: config.email.username && config.email.password ? {
        user: config.email.username,
        pass: config.email.password,
      } : undefined,
      tls: {

        rejectUnauthorized: config.nodeEnv === 'production',
      }
    });

    logger.debug('[EMAIL] Initializing EmailService', {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      user: config.email.username ? '(set)' : '(not set)',
      from: config.email.from
    });

    this.transporter.verify((error, _success) => {
      if (error) {
        logger.error('[EMAIL] Error connecting to email server', { error: error.message });
      } else {
        logger.info('[EMAIL] Email server ready to send messages');
      }
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-senha?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha - AtalJudge</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2980b9;
          }
          .footer {
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 20px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Redefinição de Senha</h1>
          </div>
          
          <div class="content">
            <p>Olá, <strong>${name}</strong>!</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>AtalJudge</strong>.</p>
            
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>Importante:</strong>
              <ul style="margin: 5px 0;">
                <li>Este link é válido por <strong>1 hora</strong></li>
                <li>Pode ser usado apenas <strong>uma vez</strong></li>
                <li>Se você não solicitou esta alteração, por favor ignore este email</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} AtalJudge. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Olá, ${name}!

Recebemos uma solicitação para redefinir a senha da sua conta no AtalJudge.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

IMPORTANTE:
- Este link é válido por 1 hora
- Pode ser usado apenas uma vez
- Se você não solicitou esta alteração, por favor ignore este email

Este é um email automático, por favor não responda.

© ${new Date().getFullYear()} AtalJudge. Todos os direitos reservados.
    `;

    try {
      await this.transporter.sendMail({
        from: `"AtalJudge" <${config.email.from}>`,
        to: email,
        subject: 'Redefinição de Senha - AtalJudge',
        text: textContent,
        html: htmlContent,
      });

      logger.info('[EMAIL] Password reset email sent successfully', { email });
    } catch (error) {
      logger.error('[EMAIL] Error sending password reset email', {
        email,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        config: {
          host: config.email.host,
          port: config.email.port,
          from: config.email.from
        }
      });
      throw new Error('Error sending email. Please try again later.');
    }
  }

  async sendPasswordResetConfirmation(email: string, name: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Senha Alterada - AtalJudge</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #27ae60;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .success-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 20px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Senha Alterada com Sucesso</h1>
          </div>
          
          <div class="content">
            <div class="success-icon"></div>
            
            <p>Olá, <strong>${name}</strong>!</p>
            
            <p>Sua senha foi alterada com sucesso no <strong>AtalJudge</strong>.</p>
            
            <p>Agora você já pode fazer login com sua nova senha.</p>
            
            <div class="warning">
              <strong>Você não reconhece esta ação?</strong>
              <p style="margin: 5px 0;">
                Se você não alterou sua senha, entre em contato com o suporte imediatamente.
                Sua conta pode ter sido comprometida.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} AtalJudge. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Olá, ${name}!

Sua senha foi alterada com sucesso no AtalJudge.

Agora você já pode fazer login com sua nova senha.

VOCÊ NÃO RECONHECE ESTA AÇÃO?
Se você não alterou sua senha, entre em contato com o suporte imediatamente.
Sua conta pode ter sido comprometida.

Este é um email automático, por favor não responda.

© ${new Date().getFullYear()} AtalJudge. Todos os direitos reservados.
    `;

    try {
      await this.transporter.sendMail({
        from: `"AtalJudge" <${config.email.from}>`,
        to: email,
        subject: 'Senha Alterada - AtalJudge',
        text: textContent,
        html: htmlContent,
      });

      logger.info('[EMAIL] Email de confirmação de reset enviado com sucesso', { email });
    } catch (error) {
      logger.error('[EMAIL] Error sending confirmation email', {
        email,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        config: {
          host: config.email.host,
          port: config.email.port,
          from: config.email.from
        }
      });
    }
  }
}
