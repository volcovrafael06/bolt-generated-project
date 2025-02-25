package com.persifix.app.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.persifix.app.PersifixApp
import com.persifix.app.data.local.PersifixDatabase
import com.persifix.app.data.repository.*

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val database = PersifixDatabase.getDatabase(applicationContext)
        val supabase = (applicationContext as PersifixApp).supabase.postgrest

        val repositories = listOf(
            ProductRepository(database.productDao(), supabase),
            CustomerRepository(database.customerDao(), supabase),
            AccessoryRepository(database.accessoryDao(), supabase),
            VisitRepository(database.visitDao(), supabase),
            QuoteRepository(database.quoteDao(), database.quoteItemDao(), supabase)
        )

        return try {
            repositories.forEach { repository ->
                repository.syncPendingItems()
                repository.refreshItems()
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
