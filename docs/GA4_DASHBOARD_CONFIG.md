# EMC — Configuração do Dashboard de Conversões GA4

## Visão Geral

Este guia explica como configurar explorations (relatórios personalizados) no Google Analytics 4 para monitorar conversões agrupadas por seção do site, posição do CTA e campanha UTM.

## 1. Marcar Eventos como Conversões no GA4

Acesse **Admin > Events** no GA4 e marque os seguintes eventos como conversões:

| Evento | Prioridade | Descrição |
|--------|-----------|-----------|
| `whatsapp_click` | Alta | Clique em qualquer link WhatsApp |
| `whatsapp_open` | Alta | Abertura do WhatsApp com UTM |
| `cta_click` | Alta | Clique em qualquer CTA |
| `phone_call` | Alta | Clique em telefone |
| `newsletter_subscribe` | Média | Inscrição na newsletter |
| `calculator_interaction` | Média | Uso da calculadora |
| `modal_submit` | Média | Envio de formulário |
| `engaged_user` | Baixa | Usuário 30s+ no site |
| `highly_engaged_user` | Baixa | Usuário 120s+ no site |

## 2. Registrar Custom Dimensions

Acesse **Admin > Custom definitions > Custom dimensions** e crie:

| Dimension Name | Event Parameter | Scope |
|---------------|----------------|-------|
| CTA Name | `cta_name` | Event |
| CTA Position | `cta_position` | Event |
| CTA Destination | `cta_destination` | Event |
| CTA Text | `cta_text` | Event |
| Click Origin | `click_origin` | Event |
| Contact Method | `contact_method` | Event |
| UTM Source (Custom) | `utm_source` | Event |
| UTM Medium (Custom) | `utm_medium` | Event |
| UTM Campaign (Custom) | `utm_campaign` | Event |
| Calculator Action | `calculator_action` | Event |
| Section Name | `section_name` | Event |
| Engagement Time (s) | `engagement_time_seconds` | Event |
| FAQ Question | `faq_question` | Event |
| FAQ Action | `faq_action` | Event |
| Modal Name | `modal_name` | Event |
| Scroll Percentage | `scroll_percentage` | Event |

## 3. Exploration: Conversões por Seção do Site

### Configuração

1. Acesse **Explore > Blank**
2. Nome: "Conversões por Seção"
3. Técnica: **Free Form**

### Dimensions
- `CTA Position`
- `Event name`

### Metrics
- `Event count`
- `Total users`
- `Conversions`

### Filtros
- Event name: `cta_click`, `whatsapp_click`, `whatsapp_open`

### Layout
- Rows: `CTA Position`
- Columns: `Event name`
- Values: `Event count`

### Resultado Esperado

| Seção | cta_click | whatsapp_click | whatsapp_open |
|-------|-----------|----------------|---------------|
| hero | 245 | 198 | 198 |
| services_section | 89 | 67 | 67 |
| cta_section_primary | 156 | 0 | 0 |
| cta_section_secondary | 134 | 112 | 112 |
| whyus_section | 78 | 65 | 65 |
| faq_section | 45 | 38 | 38 |
| floating_button | 312 | 312 | 312 |
| footer_contact | 56 | 56 | 56 |
| route_hero_* | 34 | 28 | 28 |
| knowledge_* | 23 | 19 | 19 |

## 4. Exploration: Funil de Engajamento

### Configuração

1. Acesse **Explore > Blank**
2. Nome: "Funil de Engajamento"
3. Técnica: **Funnel Exploration**

### Steps

| Step | Event |
|------|-------|
| 1 | `page_view` |
| 2 | `section_view` (section_name = "services") |
| 3 | `cta_click` |
| 4 | `whatsapp_open` |

## 5. Exploration: Campanhas UTM WhatsApp

### Configuração

1. Acesse **Explore > Blank**
2. Nome: "Campanhas WhatsApp"
3. Técnica: **Free Form**

### Dimensions
- `UTM Campaign (Custom)`
- `UTM Source (Custom)`

### Metrics
- `Event count`
- `Total users`

### Filtros
- Event name: `whatsapp_open`

### Resultado Esperado

| Campanha | Eventos | Usuários |
|----------|---------|----------|
| hero_cta_principal | 198 | 156 |
| botao_flutuante | 312 | 245 |
| cta_section_secondary | 112 | 89 |
| servico_importacao | 34 | 28 |
| faq_duvidas | 38 | 32 |
| whyus_consultor | 65 | 52 |
| footer_telefone | 56 | 45 |
| conhecimento_* | 19 | 15 |

## 6. Exploration: Engajamento por Seção

### Configuração

1. Acesse **Explore > Blank**
2. Nome: "Engajamento por Seção"
3. Técnica: **Free Form**

### Dimensions
- `Section Name`

### Metrics
- `Event count` (section_view)
- `Engagement Time (s)` (avg)

### Filtros
- Event name: `section_engagement`

## 7. Exploration: FAQ Performance

### Configuração

1. Acesse **Explore > Blank**
2. Nome: "FAQ Performance"
3. Técnica: **Free Form**

### Dimensions
- `FAQ Question`
- `FAQ Action`

### Metrics
- `Event count`

### Filtros
- Event name: `faq_interaction`

## 8. Dashboard Resumo (Looker Studio)

Para um dashboard visual completo, conecte o GA4 ao Looker Studio (datastudio.google.com):

### Scorecards (KPIs Principais)

| KPI | Evento | Métrica |
|-----|--------|---------|
| Total WhatsApp Clicks | `whatsapp_open` | Event count |
| Total CTA Clicks | `cta_click` | Event count |
| Newsletter Signups | `newsletter_subscribe` | Event count |
| Phone Calls | `phone_call` | Event count |
| Engaged Users (30s+) | `engaged_user` | Event count |
| Avg Scroll Depth | `scroll_depth` | Avg scroll_percentage |

### Gráficos Recomendados

1. **Bar Chart:** Conversões por seção (cta_position)
2. **Pie Chart:** Distribuição de contatos (WhatsApp vs Telefone vs Email)
3. **Line Chart:** Tendência de conversões ao longo do tempo
4. **Table:** Top 10 campanhas UTM por volume
5. **Heatmap:** Engajamento por seção x dia da semana
6. **Funnel:** page_view → section_view → cta_click → whatsapp_open

### Filtros do Dashboard

- Período (data range)
- Dispositivo (mobile/desktop)
- Fonte de tráfego
- Página de entrada

## 9. Alertas Automáticos

Configure alertas no GA4 em **Admin > Custom Insights**:

| Alerta | Condição | Frequência |
|--------|----------|-----------|
| Queda de conversões | `whatsapp_open` < 50% da média | Diário |
| Pico de tráfego | `page_view` > 200% da média | Diário |
| Zero conversões | `cta_click` = 0 por 24h | Diário |
| Scroll baixo | Avg `scroll_percentage` < 25% | Semanal |

## 10. Verificação

Após configurar tudo:

1. Acesse o site e clique em vários CTAs
2. Aguarde 24-48h para os dados aparecerem no GA4
3. Verifique se os custom dimensions estão populados
4. Confirme que as explorations mostram dados
5. Teste os alertas com o modo de depuração do GA4 (DebugView)
