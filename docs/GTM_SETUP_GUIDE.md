# EMC — Guia de Configuração do Google Tag Manager

## Visão Geral

O site da EMC já envia todos os eventos para o `window.dataLayer` automaticamente. Este guia explica como configurar o GTM para capturar esses eventos e criar conversões personalizadas no Google Ads.

## Pré-requisitos

- Acesso ao Google Tag Manager (tagmanager.google.com)
- Acesso ao Google Analytics 4 (analytics.google.com)
- Acesso ao Google Ads (ads.google.com)

## 1. Criar Container GTM (se ainda não existir)

1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Crie um novo container para "enviandomeucarro.com"
3. Selecione "Web" como plataforma
4. Anote o ID do container (GTM-XXXXXXX)

## 2. Eventos do DataLayer Disponíveis

O site já envia os seguintes eventos para o dataLayer:

| Evento | Descrição | Parâmetros |
|--------|-----------|------------|
| `cta_click` | Clique em qualquer CTA | `cta_name`, `cta_position`, `cta_destination`, `cta_text` |
| `whatsapp_click` | Clique em link WhatsApp | `click_origin`, `contact_method` |
| `whatsapp_open` | Abertura do WhatsApp (com UTM) | `utm_source`, `utm_medium`, `utm_campaign`, `whatsapp_number` |
| `calculator_interaction` | Interação com calculadora | `calculator_action` |
| `newsletter_subscribe` | Inscrição na newsletter | `subscription_method` |
| `phone_call` | Clique em telefone | `click_origin`, `phone_number` |
| `scroll_depth` | Profundidade de scroll | `scroll_percentage` (25, 50, 75, 100) |
| `section_view` | Seção visível no viewport | `section_name` |
| `section_engagement` | Engajamento com seção (3s+) | `section_name`, `engagement_time_seconds` |
| `faq_interaction` | Interação com FAQ | `faq_question`, `faq_action` |
| `modal_open` | Abertura de modal | `modal_name` |
| `modal_close` | Fechamento de modal | `modal_name` |
| `modal_submit` | Envio de formulário em modal | `modal_name` |
| `engaged_user` | Usuário engajado (30s+) | `engagement_threshold` |
| `highly_engaged_user` | Usuário muito engajado (120s+) | `engagement_threshold` |
| `page_loaded` | Página carregada | `page_title`, `page_url`, `page_path` |
| `navigation_click` | Clique em navegação | `nav_label`, `nav_destination` |
| `email_click` | Clique em email | `click_origin`, `email_address` |
| `social_click` | Clique em rede social | `social_platform`, `social_url` |
| `outbound_link` | Clique em link externo | `link_url`, `link_label` |

## 3. Configurar Triggers no GTM

Para cada evento acima, crie um **Custom Event Trigger**:

1. Vá em **Triggers > New**
2. Tipo: **Custom Event**
3. Event name: nome do evento (ex: `cta_click`)
4. Marque "Use regex matching" se quiser agrupar eventos

### Triggers Recomendados (Prioridade Alta)

| Trigger | Event Name | Uso |
|---------|-----------|-----|
| CTA Click | `cta_click` | Conversão principal |
| WhatsApp Click | `whatsapp_click` | Conversão de contato |
| WhatsApp Open | `whatsapp_open` | Conversão com UTM |
| Newsletter | `newsletter_subscribe` | Conversão de lead |
| Phone Call | `phone_call` | Conversão de contato |
| Calculator | `calculator_interaction` | Engajamento qualificado |

## 4. Configurar Data Layer Variables

Para cada parâmetro que deseja usar nas tags, crie uma **Data Layer Variable**:

1. Vá em **Variables > New**
2. Tipo: **Data Layer Variable**
3. Data Layer Variable Name: nome do parâmetro (ex: `cta_position`)
4. Data Layer Version: **Version 2**

### Variables Necessárias

```
cta_name, cta_position, cta_destination, cta_text
click_origin, contact_method
utm_source, utm_medium, utm_campaign
calculator_action
subscription_method
scroll_percentage
section_name, engagement_time_seconds
faq_question, faq_action
modal_name
engagement_threshold
whatsapp_number
```

## 5. Configurar Tags de Conversão Google Ads

Para cada conversão, crie uma **Google Ads Conversion Tracking** tag:

### Conversão: WhatsApp Click (Principal)
- **Tag Type:** Google Ads Conversion Tracking
- **Conversion ID:** `17154661982`
- **Conversion Label:** `whatsapp_click`
- **Trigger:** WhatsApp Click + WhatsApp Open

### Conversão: CTA Click
- **Tag Type:** Google Ads Conversion Tracking
- **Conversion ID:** `17154661982`
- **Conversion Label:** `cta_click`
- **Trigger:** CTA Click

### Conversão: Newsletter Subscribe
- **Tag Type:** Google Ads Conversion Tracking
- **Conversion ID:** `17154661982`
- **Conversion Label:** `newsletter_subscribe`
- **Trigger:** Newsletter Subscribe

### Conversão: Phone Call
- **Tag Type:** Google Ads Conversion Tracking
- **Conversion ID:** `17154661982`
- **Conversion Label:** `phone_call`
- **Trigger:** Phone Call

## 6. Posições de CTA (cta_position)

Cada CTA tem uma posição única para identificar de onde veio a conversão:

| Posição | Seção | Descrição |
|---------|-------|-----------|
| `hero` | Hero Section | CTA principal do topo |
| `cta_section_primary` | CTA Calculadora | Seção de simulação |
| `cta_section_secondary` | CTA WhatsApp | Seção de contato |
| `services_section` | Serviços | Botões individuais de serviço |
| `services_section_bottom` | Serviços | CTA assessoria completa |
| `whyus_section` | Por que Nós | CTA consultor |
| `faq_section` | FAQ | CTA tirar dúvidas |
| `floating_button` | Botão Flutuante | WhatsApp fixo |
| `footer_contact` | Footer | Telefone/WhatsApp |
| `tracking_modal` | Modal Rastreamento | Ajuda sem código |
| `route_hero_*` | Páginas de Rota | CTA cotação (topo) |
| `route_bottom_*` | Páginas de Rota | CTA cotação (rodapé) |
| `knowledge_category_*` | Centro de Conhecimento | CTA por categoria |
| `knowledge_article_*` | Centro de Conhecimento | CTA por artigo |
| `knowledge_article_bottom` | Centro de Conhecimento | CTA assessoria |
| `knowledge_main_bottom` | Centro de Conhecimento | CTA principal |
| `import_calculator_*` | Calculadora | Botões de veículo |

## 7. Campanhas UTM nos Links WhatsApp

Cada link de WhatsApp agora inclui uma tag de referência no formato:
```
[Ref: site/whatsapp/nome_da_campanha]
```

### Campanhas Ativas

| Campaign | Origem |
|----------|--------|
| `hero_cta_principal` | Botão principal do Hero |
| `cta_section_primary` | Seção CTA calculadora |
| `cta_section_secondary` | Seção CTA WhatsApp |
| `servico_*` | Botões individuais de serviço |
| `assessoria_completa` | CTA assessoria completa |
| `whyus_consultor` | Seção Por que Nós |
| `faq_duvidas` | Seção FAQ |
| `botao_flutuante` | Botão flutuante WhatsApp |
| `footer_telefone` | Footer telefone |
| `tracking_login_modal` | Modal de rastreamento |
| `rota_*_hero` | Páginas de rota (topo) |
| `rota_*_bottom` | Páginas de rota (rodapé) |
| `conhecimento_categoria_*` | Centro de Conhecimento (categoria) |
| `conhecimento_artigo_*` | Centro de Conhecimento (artigo) |
| `conhecimento_assessoria` | Centro de Conhecimento (assessoria) |
| `conhecimento_duvida` | Centro de Conhecimento (dúvida) |

## 8. Importar Configuração Automática

O arquivo `GTM_CONTAINER_CONFIG.json` contém todas as tags, triggers e variáveis pré-configuradas. Para importar:

1. Vá em **Admin > Import Container**
2. Selecione o arquivo `GTM_CONTAINER_CONFIG.json`
3. Escolha **Merge** (para preservar tags existentes)
4. Revise as alterações e publique

## 9. Verificação

Após publicar o container GTM:

1. Abra o site com `?gtm_debug=1` na URL
2. Verifique se os eventos aparecem no GTM Preview
3. Clique em CTAs e verifique se os triggers disparam
4. Confirme as conversões no Google Ads em 24-48h
