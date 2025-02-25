package com.persifix.app.data.local.dao

import androidx.room.*
import com.persifix.app.data.local.entity.QuoteEntity
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface QuoteDao {
    @Query("SELECT * FROM quotes ORDER BY date DESC")
    fun getAllQuotes(): Flow<List<QuoteEntity>>

    @Query("SELECT * FROM quotes WHERE customerId = :customerId ORDER BY date DESC")
    fun getQuotesByCustomer(customerId: String): Flow<List<QuoteEntity>>

    @Query("SELECT * FROM quotes WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC")
    fun getQuotesByDateRange(startDate: Date, endDate: Date): Flow<List<QuoteEntity>>

    @Query("SELECT * FROM quotes WHERE status = :status ORDER BY date DESC")
    fun getQuotesByStatus(status: String): Flow<List<QuoteEntity>>

    @Query("SELECT * FROM quotes WHERE syncStatus = :status")
    suspend fun getQuotesBySyncStatus(status: Int): List<QuoteEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuote(quote: QuoteEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotes(quotes: List<QuoteEntity>)

    @Update
    suspend fun updateQuote(quote: QuoteEntity)

    @Delete
    suspend fun deleteQuote(quote: QuoteEntity)

    @Query("UPDATE quotes SET syncStatus = :status WHERE id = :quoteId")
    suspend fun updateSyncStatus(quoteId: String, status: Int)

    @Query("UPDATE quotes SET status = :status WHERE id = :quoteId")
    suspend fun updateQuoteStatus(quoteId: String, status: String)
}
