package com.persifix.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "accessories")
data class AccessoryEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val stock: Int,
    val syncStatus: Int = SYNC_PENDING,
    val lastModified: Long = System.currentTimeMillis()
) {
    companion object {
        const val SYNC_PENDING = 0
        const val SYNC_COMPLETE = 1
        const val SYNC_FAILED = 2
    }
}
