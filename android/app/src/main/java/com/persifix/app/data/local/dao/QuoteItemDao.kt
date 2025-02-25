package com.persifix.app.data.local.dao

import androidx.room.*
import com.persifix.app.data.local.entity.QuoteItemEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface QuoteItemDao {
    @Query("SELECT * FROM quote_items WHERE quoteId = :quoteId")
    fun getQuoteItems(quoteId: String): Flow<List<QuoteItemEntity>>

    @Query("SELECT * FROM quote_items WHERE syncStatus = :status")
    suspend fun getQuoteItemsBySyncStatus(status: Int): List<QuoteItemEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuoteItem(quoteItem: QuoteItemEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuoteItems(quoteItems: List<QuoteItemEntity>)

    @Update
    suspend fun updateQuoteItem(quoteItem: QuoteItemEntity)

    @Delete
    suspend fun deleteQuoteItem(quoteItem: QuoteItemEntity)

    @Query("DELETE FROM quote_items WHERE quoteId = :quoteId")
    suspend fun deleteQuoteItems(quoteId: String)

    @Query("UPDATE quote_items SET syncStatus = :status WHERE id = :itemId")
    suspend fun updateSyncStatus(itemId: String, status: Int)
}
