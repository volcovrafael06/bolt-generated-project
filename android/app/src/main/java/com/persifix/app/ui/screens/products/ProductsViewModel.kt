package com.persifix.app.ui.screens.products

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.*
import com.persifix.app.PersifixApp
import com.persifix.app.data.local.PersifixDatabase
import com.persifix.app.data.repository.ProductRepository
import com.persifix.app.worker.SyncWorker
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class ProductsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: ProductRepository
    private val workManager = WorkManager.getInstance(application)
    
    private val _syncStatus = MutableStateFlow(false)
    val syncStatus = _syncStatus.asStateFlow()

    init {
        val database = PersifixDatabase.getDatabase(application)
        repository = ProductRepository(
            database.productDao(),
            (application as PersifixApp).supabase.postgrest
        )
        setupPeriodicSync()
    }

    val products = repository.allProducts

    private fun setupPeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES,
            5, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        workManager.enqueueUniquePeriodicWork(
            "sync_products",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )

        viewModelScope.launch {
            workManager.getWorkInfosForUniqueWorkLiveData("sync_products")
                .observeForever { workInfos ->
                    _syncStatus.value = workInfos?.any { it.state == WorkInfo.State.RUNNING } == true
                }
        }
    }

    fun refreshProducts() {
        viewModelScope.launch {
            repository.refreshProducts()
        }
    }
}
