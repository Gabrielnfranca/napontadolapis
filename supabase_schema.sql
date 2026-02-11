-- Copie e cole este comando no SQL Editor do seu Dashboard Supabase.
-- Isso criará a tabela para salvar suas simulações.

create table saved_skus (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  sku_code text, -- código SKU (ex: SHP-FON-1234)
  input_data jsonb not null, -- Dados de entrada completos
  result_data jsonb not null, -- Resultados do cálculo completos
  net_profit numeric, -- Para permitir consultas/filtros por lucro depois
  net_margin numeric -- Para permitir consultas/filtros por margem depois
);

-- Habilitar acesso público para leitura/escrita (enquanto não temos Auth)
-- ATENÇÃO: Em produção real com Auth, você usaria RLS (Row Level Security).
alter table saved_skus enable row level security;

create policy "Public Access"
on saved_skus
for all
using (true)
with check (true);