-- Drop all existing policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified profile policies
CREATE POLICY "profiles_select_policy" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "profiles_insert_policy" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Drop existing policies for acessorios if they exist
DROP POLICY IF EXISTS "acessorios_select_policy" ON acessorios;
DROP POLICY IF EXISTS "acessorios_insert_policy" ON acessorios;
DROP POLICY IF EXISTS "acessorios_update_policy" ON acessorios;
DROP POLICY IF EXISTS "acessorios_delete_policy" ON acessorios;

-- Create acessorios table if it doesn't exist
CREATE TABLE IF NOT EXISTS acessorios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on acessorios
ALTER TABLE acessorios ENABLE ROW LEVEL SECURITY;

-- Create policies for acessorios
CREATE POLICY "acessorios_select_policy" 
ON acessorios FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "acessorios_insert_policy" 
ON acessorios FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "acessorios_update_policy" 
ON acessorios FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "acessorios_delete_policy" 
ON acessorios FOR DELETE 
TO authenticated 
USING (true);

-- Create or replace trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_acessorios_updated_at ON acessorios;
CREATE TRIGGER update_acessorios_updated_at
    BEFORE UPDATE ON acessorios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
