package com.persifix.app.data.local.dao

import androidx.room.*
import com.persifix.app.data.local.entity.VisitEntity
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface VisitDao {
    @Query("SELECT * FROM visits ORDER BY date DESC")
    fun getAllVisits(): Flow<List<VisitEntity>>

    @Query("SELECT * FROM visits WHERE customerId = :customerId ORDER BY date DESC")
    fun getVisitsByCustomer(customerId: String): Flow<List<VisitEntity>>

    @Query("SELECT * FROM visits WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC")
    fun getVisitsByDateRange(startDate: Date, endDate: Date): Flow<List<VisitEntity>>

    @Query("SELECT * FROM visits WHERE syncStatus = :status")
    suspend fun getVisitsBySyncStatus(status: Int): List<VisitEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVisit(visit: VisitEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVisits(visits: List<VisitEntity>)

    @Update
    suspend fun updateVisit(visit: VisitEntity)

    @Delete
    suspend fun deleteVisit(visit: VisitEntity)

    @Query("UPDATE visits SET syncStatus = :status WHERE id = :visitId")
    suspend fun updateSyncStatus(visitId: String, status: Int)
}
