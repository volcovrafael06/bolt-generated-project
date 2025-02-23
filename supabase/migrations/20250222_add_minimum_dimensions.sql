-- Adiciona colunas para dimensões mínimas
ALTER TABLE produtos
ADD COLUMN altura_minima DECIMAL(10,2),
ADD COLUMN largura_minima DECIMAL(10,2),
ADD COLUMN area_minima DECIMAL(10,2);
