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
      preco_custo: parseFloat(produto.cost_price) || 0,
      margem_lucro: parseFloat(produto.profit_margin) || 0,
      preco_venda: parseFloat(produto.sale_price) || 0,
      metodo_calculo: produto.calculation_method,
      altura_minima: produto.altura_minima ? parseFloat(produto.altura_minima) : null,
      largura_minima: produto.largura_minima ? parseFloat(produto.largura_minima) : null,
      largura_maxima: produto.largura_maxima ? parseFloat(produto.largura_maxima) : null,
      area_minima: produto.area_minima ? parseFloat(produto.area_minima) : null
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
      preco_custo: parseFloat(produto.cost_price) || 0,
      margem_lucro: parseFloat(produto.profit_margin) || 0,
      preco_venda: parseFloat(produto.sale_price) || 0,
      metodo_calculo: produto.calculation_method,
      altura_minima: produto.altura_minima ? parseFloat(produto.altura_minima) : null,
      largura_minima: produto.largura_minima ? parseFloat(produto.largura_minima) : null,
      largura_maxima: produto.largura_maxima ? parseFloat(produto.largura_maxima) : null,
      area_minima: produto.area_minima ? parseFloat(produto.area_minima) : null
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
