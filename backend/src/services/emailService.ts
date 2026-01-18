import nodemailer from "nodemailer";
import { env } from "../env.js";

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitPriceWholesale: number;
};

type CheckoutPayload = {
  customerName: string;
  email: string;
  phone?: string;
  address?: string;
  items: OrderItem[];
  total: number;
};

/**
 * Template de e-mail para o CLIENTE
 * Confirma os produtos do pedido
 */
function buildCustomerEmailHtml(payload: CheckoutPayload) {
  const itemsRows = payload.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
            ${item.name}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px;">
            R$ ${item.unitPrice.toFixed(2)}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; font-weight: 600;">
            R$ ${(item.unitPrice * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Pedido - Vortex Pharma</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b0c10 0%, #1a1d24 100%); padding: 32px 40px; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Vortex Pharma
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                Peptídeos de Alta Qualidade
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 40px 24px;">
              <h2 style="margin: 0 0 16px; color: #0f1115; font-size: 22px; font-weight: 700;">
                Olá, ${payload.customerName}! 👋
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Recebemos seu pedido com sucesso! Por favor, <strong>confira os produtos abaixo</strong> e verifique se está tudo correto.
              </p>
            </td>
          </tr>
          
          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 16px; color: #0f1115; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  📦 Resumo do Pedido
                </h3>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #0b0c10;">
                      <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; border-radius: 8px 0 0 0;">
                        Produto
                      </th>
                      <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        Qtd
                      </th>
                      <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        Preço Un.
                      </th>
                      <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; border-radius: 0 8px 0 0;">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody style="background-color: #ffffff;">
                    ${itemsRows}
                  </tbody>
                </table>
                
                <!-- Total -->
                <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="color: #ffffff; font-size: 16px; font-weight: 600;">
                        Total do Pedido
                      </td>
                      <td style="text-align: right; color: #ffffff; font-size: 24px; font-weight: 800;">
                        R$ ${payload.total.toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; border: 1px solid #fcd34d;">
                <h4 style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 700;">
                  📋 Seus Dados
                </h4>
                <p style="margin: 0 0 8px; color: #78350f; font-size: 14px;">
                  <strong>E-mail:</strong> ${payload.email}
                </p>
                ${payload.phone ? `<p style="margin: 0 0 8px; color: #78350f; font-size: 14px;"><strong>Telefone:</strong> ${payload.phone}</p>` : ""}
                ${payload.address ? `<p style="margin: 0; color: #78350f; font-size: 14px;"><strong>Endereço:</strong> ${payload.address}</p>` : ""}
              </div>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; border: 1px solid #a7f3d0;">
                <h4 style="margin: 0 0 12px; color: #065f46; font-size: 14px; font-weight: 700;">
                  ✅ Próximos Passos
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
                  <li>Confirme se os produtos acima estão corretos</li>
                  <li>Aguarde nosso contato com as formas de pagamento</li>
                  <li>Após a confirmação do pagamento, enviaremos seu pedido</li>
                </ol>
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                Algum produto incorreto ou dúvida? Responda este e-mail!
              </p>
              <a href="mailto:vortexpharma1@gmail.com" style="display: inline-block; background: linear-gradient(135deg, #0b0c10 0%, #1a1d24 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Entrar em Contato
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0c10; padding: 24px 40px; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">
                Vortex Pharma
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                vortexpharma1@gmail.com
              </p>
              <p style="margin: 16px 0 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                Este é um e-mail automático. Por favor, não responda diretamente. Para dúvidas, entre em contato conosco.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Template de e-mail INTERNO para a loja
 * Notifica a equipe sobre o novo pedido
 */
function buildInternalEmailHtml(payload: CheckoutPayload) {
  const itemsRows = payload.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-align: right;">R$ ${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-align: right;">R$ ${(item.unitPrice * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color: #f97316; padding: 20px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px;">🛒 Novo Pedido Recebido!</h1>
    </div>
    
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 16px; color: #374151;">Dados do Cliente</h2>
      <table style="width: 100%; margin-bottom: 24px;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Nome:</td>
          <td style="padding: 4px 0; font-weight: 600;">${payload.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">E-mail:</td>
          <td style="padding: 4px 0;"><a href="mailto:${payload.email}" style="color: #f97316;">${payload.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Telefone:</td>
          <td style="padding: 4px 0;">${payload.phone || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Endereço:</td>
          <td style="padding: 4px 0;">${payload.address || "-"}</td>
        </tr>
      </table>
      
      <h2 style="margin: 0 0 16px; font-size: 16px; color: #374151;">Itens do Pedido</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #0b0c10; color: #ffffff;">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px;">Produto</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px;">Qtd</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px;">Preço Un.</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      
      <div style="background-color: #0b0c10; color: #ffffff; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: 600;">TOTAL:</span>
        <span style="font-size: 20px; font-weight: 800; color: #f97316;">R$ ${payload.total.toFixed(2)}</span>
      </div>
      
      <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f97316;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Ação necessária:</strong> Enviar formas de pagamento para o cliente, aguardar comprovante e atualizar status do pedido.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendOrderEmail(payload: CheckoutPayload) {
  // E-mail para o CLIENTE (confirmação do pedido)
  const customerHtml = buildCustomerEmailHtml(payload);
  
  await transport.sendMail({
    from: `"Vortex Pharma" <${env.SMTP_FROM}>`,
    to: payload.email,
    subject: "📦 Confirmação do seu pedido - Vortex Pharma",
    html: customerHtml,
    replyTo: "vortexpharma1@gmail.com",
  });

  // E-mail INTERNO para a loja (notificação de novo pedido)
  const internalHtml = buildInternalEmailHtml(payload);
  
  await transport.sendMail({
    from: `"Sistema Vortex Pharma" <${env.SMTP_FROM}>`,
    to: env.ORDER_EMAIL_TO,
    subject: `🛒 Novo pedido de ${payload.customerName} - R$ ${payload.total.toFixed(2)}`,
    html: internalHtml,
    replyTo: payload.email,
  });
}
