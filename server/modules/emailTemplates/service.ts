/**
 * Email Templates Service — Business logic for email template management.
 * Includes default template seeding and template rendering.
 */

import {
  listEmailTemplates,
  getEmailTemplateById,
  getEmailTemplateBySlug,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getActiveTemplateBySlug,
  type CreateEmailTemplateInput,
  type UpdateEmailTemplateInput,
  type EmailTemplateRecord,
} from "./repository";

// ══════════════════════════════════════════════════════════════
// DEFAULT TEMPLATES — Seeded on first access
// ══════════════════════════════════════════════════════════════

const DEFAULT_TEMPLATES: CreateEmailTemplateInput[] = [
  {
    slug: "stage_aguardando_embarque",
    name: "Mudança de Estágio: Aguardando Embarque",
    description: "Enviado quando o processo muda para 'Aguardando Embarque'.",
    subject: "🚢 Seu veículo está aguardando embarque — Enviando Meu Carro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🚢 Atualização do Transporte</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Temos uma atualização sobre o transporte do seu veículo!</p>
    <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>📋 Status atual:</strong> Aguardando Embarque</p>
    </div>
    <p style="font-size: 15px; color: #4b5563;">O seu veículo já está na fase de preparação para embarque. Em breve ele será carregado no container e seguirá viagem.</p>
    {{#trackingCode}}<p style="font-size: 15px; color: #4b5563;">Acompanhe em tempo real: <strong>{{trackingCode}}</strong></p>{{/trackingCode}}
    <p style="font-size: 15px; color: #4b5563;">Qualquer dúvida, estamos à disposição.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Atenciosamente,<br/>Equipe Enviando Meu Carro<br/>📞 WhatsApp: +55 11 99244-8920</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

Temos uma atualização sobre o transporte do seu veículo!

📋 Status atual: Aguardando Embarque
O seu veículo já está na fase de preparação para embarque. Em breve ele será carregado no container e seguirá viagem.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Enviando Meu Carro
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! 🚢

Atualização do seu veículo:
📋 *Status: Aguardando Embarque*

Seu veículo está em preparação para embarque. Em breve seguirá viagem!

Equipe Enviando Meu Carro`,
    category: "stage_change",
    availableVariables: JSON.stringify(["name", "trackingCode", "blNumber", "vehicleDescription"]),
    isDefault: true,
  },
  {
    slug: "stage_em_transito",
    name: "Mudança de Estágio: Em Trânsito",
    description: "Enviado quando o veículo embarca e está em trânsito marítimo.",
    subject: "🚢 Seu veículo está em trânsito! — Enviando Meu Carro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🚢 Veículo em Trânsito!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Ótima notícia! Seu veículo está a caminho! 🎉</p>
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px; color: #166534;"><strong>📋 Status atual:</strong> Em Trânsito</p>
    </div>
    <p style="font-size: 15px; color: #4b5563;">O container com seu veículo já embarcou e está navegando rumo ao destino.</p>
    {{#trackingCode}}<p style="font-size: 15px; color: #4b5563;">Acompanhe em tempo real: <strong>{{trackingCode}}</strong></p>{{/trackingCode}}
    <p style="font-size: 15px; color: #4b5563;">Assim que o navio chegar ao porto de destino, você será notificado.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Atenciosamente,<br/>Equipe Enviando Meu Carro<br/>📞 WhatsApp: +55 11 99244-8920</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

Ótima notícia! Seu veículo está a caminho! 🎉

📋 Status atual: Em Trânsito
O container com seu veículo já embarcou e está navegando rumo ao destino.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Enviando Meu Carro`,
    whatsappMessage: `Olá {{name}}! 🚢🎉

Ótima notícia!
📋 *Status: Em Trânsito*

Seu veículo já embarcou e está a caminho!

Equipe Enviando Meu Carro`,
    category: "stage_change",
    availableVariables: JSON.stringify(["name", "trackingCode", "blNumber", "vehicleDescription"]),
    isDefault: true,
  },
  {
    slug: "stage_fase_documental",
    name: "Mudança de Estágio: Fase Documental",
    description: "Enviado quando o processo entra na fase de Licença de Importação.",
    subject: "📄 Fase documental em andamento — Enviando Meu Carro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📄 Fase Documental</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Temos uma atualização sobre o transporte do seu veículo!</p>
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>📋 Status atual:</strong> Fase Documental (LI)</p>
    </div>
    <p style="font-size: 15px; color: #4b5563;">Estamos processando a documentação necessária para a importação do seu veículo. Esta fase inclui a obtenção da Licença de Importação (LI) e demais trâmites legais.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Atenciosamente,<br/>Equipe Enviando Meu Carro<br/>📞 WhatsApp: +55 11 99244-8920</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

📋 Status atual: Fase Documental (Licença de Importação)
Estamos processando a documentação necessária para a importação do seu veículo.

Atenciosamente,
Equipe Enviando Meu Carro`,
    whatsappMessage: `Olá {{name}}! 📄

Atualização do seu veículo:
📋 *Status: Fase Documental (LI)*

Estamos processando a documentação de importação.

Equipe Enviando Meu Carro`,
    category: "stage_change",
    availableVariables: JSON.stringify(["name", "trackingCode", "blNumber", "vehicleDescription"]),
    isDefault: true,
  },
  {
    slug: "stage_em_desembaraco",
    name: "Mudança de Estágio: Desembaraço Aduaneiro",
    description: "Enviado quando o veículo chega ao porto e entra em desembaraço.",
    subject: "🏗️ Seu veículo chegou ao porto! — Enviando Meu Carro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🏗️ Veículo no Porto!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Seu veículo chegou ao porto de destino! 🎉</p>
    <div style="background: #faf5ff; border-left: 4px solid #a855f7; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px; color: #6b21a8;"><strong>📋 Status atual:</strong> Desembaraço Aduaneiro</p>
    </div>
    <p style="font-size: 15px; color: #4b5563;">O container já foi descarregado e estamos realizando o processo de desembaraço aduaneiro.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Atenciosamente,<br/>Equipe Enviando Meu Carro<br/>📞 WhatsApp: +55 11 99244-8920</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

Seu veículo chegou ao porto de destino! 🎉

📋 Status atual: Desembaraço Aduaneiro
O container já foi descarregado e estamos realizando a liberação alfandegária.

Atenciosamente,
Equipe Enviando Meu Carro`,
    whatsappMessage: `Olá {{name}}! 🏗️🎉

Seu veículo chegou ao porto!
📋 *Status: Desembaraço Aduaneiro*

Estamos realizando a liberação alfandegária.

Equipe Enviando Meu Carro`,
    category: "stage_change",
    availableVariables: JSON.stringify(["name", "trackingCode", "blNumber", "vehicleDescription"]),
    isDefault: true,
  },
  {
    slug: "stage_concluido",
    name: "Mudança de Estágio: Concluído",
    description: "Enviado quando o veículo é entregue com sucesso.",
    subject: "✅ Veículo entregue com sucesso! — Enviando Meu Carro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">✅ Veículo Entregue!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Parabéns! Seu veículo foi entregue com sucesso! 🎉🚗</p>
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px; color: #166534;"><strong>📋 Status:</strong> Concluído</p>
    </div>
    <p style="font-size: 15px; color: #4b5563;">O processo de transporte do seu veículo foi finalizado. Esperamos que tudo tenha atendido suas expectativas.</p>
    <p style="font-size: 15px; color: #4b5563;">Se precisar de qualquer suporte adicional ou quiser importar/exportar outro veículo, conte conosco!</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Obrigado por confiar na Enviando Meu Carro.<br/>📞 WhatsApp: +55 11 99244-8920</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

Parabéns! Seu veículo foi entregue com sucesso! 🎉🚗

Obrigado por confiar na Enviando Meu Carro.
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! ✅🎉🚗

*Parabéns! Seu veículo foi entregue!*

Obrigado por confiar na Enviando Meu Carro. Precisando, conte conosco!

Equipe Enviando Meu Carro`,
    category: "stage_change",
    availableVariables: JSON.stringify(["name", "trackingCode", "blNumber", "vehicleDescription"]),
    isDefault: true,
  },
  {
    slug: "tracking_code_approved",
    name: "Código de Rastreamento Aprovado",
    description: "Enviado quando o admin aprova o código de rastreamento do cliente.",
    subject: "🔑 Seu código de rastreamento está ativo! — Enviando Meu Carro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔑 Código de Rastreamento</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Seu código de rastreamento foi aprovado e já está ativo!</p>
    <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">Seu código de rastreamento:</p>
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1e40af; letter-spacing: 2px; font-family: monospace;">{{trackingCode}}</p>
    </div>
    <p style="font-size: 15px; color: #4b5563;">Use este código para acompanhar o status do seu veículo em tempo real no nosso site.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Atenciosamente,<br/>Equipe Enviando Meu Carro<br/>📞 WhatsApp: +55 11 99244-8920</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

Seu código de rastreamento foi aprovado e já está ativo!

🔑 Código: {{trackingCode}}

Use este código para acompanhar o status do seu veículo em tempo real.

Atenciosamente,
Equipe Enviando Meu Carro`,
    whatsappMessage: `Olá {{name}}! 🔑

Seu código de rastreamento está ativo!

*Código:* {{trackingCode}}

Use para acompanhar seu veículo em tempo real.

Equipe Enviando Meu Carro`,
    category: "tracking",
    availableVariables: JSON.stringify(["name", "trackingCode", "blNumber"]),
    isDefault: true,
  },
  {
    slug: "onboarding_invite",
    name: "Convite de Onboarding",
    description: "Enviado quando o admin cria um convite para novo cliente.",
    subject: "📋 Bem-vindo à Enviando Meu Carro — Complete seu cadastro",
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📋 Bem-vindo!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Você foi convidado para completar seu cadastro na Enviando Meu Carro.</p>
    <p style="font-size: 15px; color: #4b5563;">Clique no link abaixo para preencher seus dados e documentos:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{inviteLink}}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Completar Cadastro</a>
    </div>
    <p style="font-size: 13px; color: #9ca3af;">Este link expira em 7 dias.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af;">Atenciosamente,<br/>Equipe Enviando Meu Carro</p>
  </div>
</div>`,
    bodyText: `Olá {{name}},

Você foi convidado para completar seu cadastro na Enviando Meu Carro.

Acesse: {{inviteLink}}

Este link expira em 7 dias.

Atenciosamente,
Equipe Enviando Meu Carro`,
    whatsappMessage: `Olá {{name}}! 📋

Você foi convidado para completar seu cadastro na Enviando Meu Carro.

Acesse: {{inviteLink}}

Equipe Enviando Meu Carro`,
    category: "onboarding",
    availableVariables: JSON.stringify(["name", "inviteLink", "email"]),
    isDefault: true,
  },
];

// ══════════════════════════════════════════════════════════════
// SEED DEFAULTS
// ══════════════════════════════════════════════════════════════

let seeded = false;

export async function seedDefaultTemplates(): Promise<void> {
  if (seeded) return;
  seeded = true;

  for (const tpl of DEFAULT_TEMPLATES) {
    const existing = await getEmailTemplateBySlug(tpl.slug);
    if (!existing) {
      await createEmailTemplate(tpl);
    }
  }
}

// ══════════════════════════════════════════════════════════════
// RENDER TEMPLATE — Replace {{variables}} with values
// ══════════════════════════════════════════════════════════════

export function renderTemplate(
  template: string,
  variables: Record<string, string | undefined>
): string {
  let result = template;

  // Handle conditional blocks: {{#var}}...{{/var}}
  for (const [key, value] of Object.entries(variables)) {
    const conditionalRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{/${key}\\}\\}`, "g");
    if (value && value.trim().length > 0) {
      // Replace conditional with its content (keeping inner text)
      result = result.replace(conditionalRegex, "$1");
    } else {
      // Remove the entire conditional block
      result = result.replace(conditionalRegex, "");
    }
  }

  // Replace simple {{variable}} placeholders
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value ?? "");
  }

  return result;
}

// ══════════════════════════════════════════════════════════════
// SERVICE FUNCTIONS (delegate to repository)
// ══════════════════════════════════════════════════════════════

export {
  listEmailTemplates,
  getEmailTemplateById,
  getEmailTemplateBySlug,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getActiveTemplateBySlug,
};

export type { EmailTemplateRecord, CreateEmailTemplateInput, UpdateEmailTemplateInput };
