package com.persifix.app.data.local.dao

import androidx.room.*
import com.persifix.app.data.local.entity.AccessoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AccessoryDao {
    @Query("SELECT * FROM accessories ORDER BY name ASC")
    fun getAllAccessories(): Flow<List<AccessoryEntity>>

    @Query("SELECT * FROM accessories WHERE id = :id")
    suspend fun getAccessoryById(id: String): AccessoryEntity?

    @Query("SELECT * FROM accessories WHERE syncStatus = :status")
    suspend fun getAccessoriesBySyncStatus(status: Int): List<AccessoryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccessory(accessory: AccessoryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccessories(accessories: List<AccessoryEntity>)

    @Update
    suspend fun updateAccessory(accessory: AccessoryEntity)

    @Delete
    suspend fun deleteAccessory(accessory: AccessoryEntity)

    @Query("UPDATE accessories SET syncStatus = :status WHERE id = :accessoryId")
    suspend fun updateSyncStatus(accessoryId: String, status: Int)

    @Query("UPDATE accessories SET stock = stock - :quantity WHERE id = :accessoryId")
    suspend fun decreaseStock(accessoryId: String, quantity: Int)
}
