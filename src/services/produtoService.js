import { supabase } from '../supabase/client'

export const produtoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
    if (error) throw error
    return data
  },

  async create(produto) {
    // Ajustando os nomes dos campos para corresponder ao banco de dados
    const produtoFormatted = {
      produto: produto.product,
      modelo: produto.model,
      tecido: produto.material,
      nome: produto.name,
      codigo: produto.code,
      preco_custo: produto.cost_price,
      margem_lucro: produto.profit_margin,
      preco_venda: produto.sale_price,
      metodo_calculo: produto.calculation_method
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert([produtoFormatted])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, produto) {
    // Ajustando os nomes dos campos para corresponder ao banco de dados
    const produtoFormatted = {
      produto: produto.product,
      modelo: produto.model,
      tecido: produto.material,
      nome: produto.name,
      codigo: produto.code,
      preco_custo: produto.cost_price,
      margem_lucro: produto.profit_margin,
      preco_venda: produto.sale_price,
      metodo_calculo: produto.calculation_method
    }

    const { data, error } = await supabase
      .from('produtos')
      .update(produtoFormatted)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
