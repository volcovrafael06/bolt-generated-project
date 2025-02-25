package com.persifix.app.data.repository

import com.persifix.app.data.local.dao.ProductDao
import com.persifix.app.data.local.entity.ProductEntity
import com.persifix.app.data.local.entity.ProductEntity.Companion.SYNC_COMPLETE
import com.persifix.app.data.local.entity.ProductEntity.Companion.SYNC_FAILED
import com.persifix.app.data.local.entity.ProductEntity.Companion.SYNC_PENDING
import io.github.jan.supabase.postgrest.Postgrest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import java.net.UnknownHostException

class ProductRepository(
    private val productDao: ProductDao,
    private val supabase: Postgrest
) {
    val allProducts: Flow<List<ProductEntity>> = productDao.getAllProducts()

    suspend fun insertProduct(product: ProductEntity) {
        productDao.insertProduct(product)
        syncProduct(product)
    }

    suspend fun updateProduct(product: ProductEntity) {
        productDao.updateProduct(product.copy(syncStatus = SYNC_PENDING))
        syncProduct(product)
    }

    suspend fun deleteProduct(product: ProductEntity) {
        productDao.deleteProduct(product)
        try {
            supabase.from("products")
                .delete {
                    filter { eq("id", product.id) }
                }
        } catch (e: Exception) {
            // Handle deletion error
        }
    }

    private suspend fun syncProduct(product: ProductEntity) {
        try {
            supabase.from("products")
                .upsert(product)
            productDao.updateSyncStatus(product.id, SYNC_COMPLETE)
        } catch (e: UnknownHostException) {
            productDao.updateSyncStatus(product.id, SYNC_PENDING)
        } catch (e: Exception) {
            productDao.updateSyncStatus(product.id, SYNC_FAILED)
        }
    }

    suspend fun syncPendingProducts() {
        val pendingProducts = productDao.getProductsBySyncStatus(SYNC_PENDING)
        pendingProducts.forEach { syncProduct(it) }
    }

    suspend fun refreshProducts() {
        try {
            val remoteProducts = supabase.from("products").select().decodeList<ProductEntity>()
            productDao.insertProducts(remoteProducts.map { it.copy(syncStatus = SYNC_COMPLETE) })
        } catch (e: Exception) {
            // Handle refresh error
        }
    }
}
