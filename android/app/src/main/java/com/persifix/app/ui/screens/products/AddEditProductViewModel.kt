package com.persifix.app.ui.screens.products

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.persifix.app.PersifixApp
import com.persifix.app.data.local.PersifixDatabase
import com.persifix.app.data.local.entity.ProductEntity
import com.persifix.app.data.repository.ProductRepository
import kotlinx.coroutines.launch
import java.util.*

class AddEditProductViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: ProductRepository

    init {
        val database = PersifixDatabase.getDatabase(application)
        repository = ProductRepository(
            database.productDao(),
            (application as PersifixApp).supabase.postgrest
        )
    }

    fun saveProduct(
        name: String,
        description: String,
        price: Double,
        measureUnit: String
    ) {
        val product = ProductEntity(
            id = UUID.randomUUID().toString(),
            name = name,
            description = description.takeIf { it.isNotBlank() },
            price = price,
            measureUnit = measureUnit
        )

        viewModelScope.launch {
            repository.insertProduct(product)
        }
    }
}
